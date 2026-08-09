import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    RunContext,
    cli,
    function_tool,
    room_io,
    tokenize,
)
from livekit.plugins import deepgram, google, murf, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from database import get_user, save_user
from prompts import SYSTEM_PROMPT

logger = logging.getLogger("agent")

load_dotenv(".env.local")

STT_LANGUAGE = "multi"
TTS_LOCALE = "hi-IN"
TTS_VOICE = "hi-IN-pooja"
TTS_STYLE = "Conversational"


class Assistant(Agent):
    def __init__(self, user_id: str) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)
        self._user_id = user_id

    # ------------------------------------------------------------------
    # Tool 1 — look up a caller at session start
    # ------------------------------------------------------------------
    @function_tool
    async def lookup_caller(self, context: RunContext) -> dict:
        """
        Look up the current caller in the database at the start of the session.

        Call this FIRST before saying anything to the user.
        Returns a dict with 'found' (bool) and either the caller's saved
        profile or an empty record if they are new.
        """
        user_id = self._user_id
        logger.info("Looking up caller with user_id=%s", user_id)
        profile = get_user(user_id)
        if profile:
            logger.info("Returning caller: %s", profile.get("name"))
            return {"found": True, **profile}
        return {"found": False, "user_id": user_id}

    # ------------------------------------------------------------------
    # Tool 2 — save what you learned about the caller (after consent)
    # ------------------------------------------------------------------
    @function_tool
    async def save_caller_info(
        self,
        context: RunContext,
        name: str,
        language_preference: str = "",
        current_level: str = "",
        topics_covered: list[str] | None = None,
        common_mistakes: list[str] | None = None,
    ) -> str:
        """
        Save or update the caller's profile in the database.

        IMPORTANT: You MUST have received explicit verbal consent from the
        caller before calling this function.  If they said "no" or did not
        give consent, do NOT call this function.

        Args:
            name: The caller's first name (required).
            language_preference: Preferred language, e.g. 'Hindi', 'English', 'Hinglish'.
            current_level: Academic level, e.g. 'Class 8', 'Beginner', 'Intermediate'.
            topics_covered: List of topics discussed in this or prior sessions.
            common_mistakes: Recurring mistakes the learner makes.
        """
        user_data = {
            "user_id": self._user_id,
            "name": name,
            "language_preference": language_preference,
            "current_level": current_level,
            "topics_covered": topics_covered or [],
            "common_mistakes": common_mistakes or [],
        }
        save_user(user_data)
        logger.info("Saved profile for %s (user_id=%s)", name, self._user_id)
        return f"Profile saved for {name}."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    # Logging setup
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Derive a stable user_id from the first non-agent participant identity.
    # Falls back to the room name so every reconnect in the same room is
    # treated as the same person.
    await ctx.connect()

    user_id = ctx.room.name  # default
    for participant in ctx.room.remote_participants.values():
        if participant.identity:
            user_id = participant.identity
            break

    logger.info("Session user_id resolved to: %s", user_id)

    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and
    # the LiveKit turn detector
    session = AgentSession(
        stt=deepgram.STT(
            model="nova-3",
            language=STT_LANGUAGE,
        ),
        llm=google.LLM(model="gemini-3.5-flash"),
        tts=murf.TTS(
            locale=TTS_LOCALE,
            voice=TTS_VOICE,
            style=TTS_STYLE,
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    await session.start(
        agent=Assistant(user_id=user_id),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )


if __name__ == "__main__":
    cli.run_app(server)
