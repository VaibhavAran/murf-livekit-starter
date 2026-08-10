import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    function_tool,
    room_io,
    tokenize,
)
from livekit.plugins import deepgram, google, murf, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from database import get_user, save_user
from prompts import build_instructions

logger = logging.getLogger("agent")

load_dotenv(".env.local")

STT_LANGUAGE = "multi"
TTS_LOCALE = "hi-IN"
TTS_VOICE = "hi-IN-pooja"
TTS_STYLE = "Conversational"


class Assistant(Agent):
    def __init__(self, user_id: str, profile: dict | None = None) -> None:
        super().__init__(instructions=build_instructions(profile))
        self._user_id = user_id
        self._has_consent = False  # tracks if user gave save consent

    # ------------------------------------------------------------------
    # Tool 1 — Save caller info (requires explicit consent)
    # ------------------------------------------------------------------
    @function_tool
    async def save_caller_info(
        self,
        name: str,
        language_preference: str = "",
        current_level: str = "",
        topics_covered: list[str] | None = None,
        common_mistakes: list[str] | None = None,
    ) -> str:
        """
        Save or update the caller's profile so they can be recognised next
        time. You MUST have received explicit verbal consent from the caller
        before calling this. If they said no or did not give consent, do NOT
        call this function.
        """
        logger.info("Tool called: save_caller_info for %s", name)

        profile = {
            "user_id": self._user_id,
            "name": name,
            "language_preference": language_preference,
            "current_level": current_level,
            "topics_covered": topics_covered or [],
            "common_mistakes": common_mistakes or [],
        }
        save_user(profile)
        self._has_consent = True
        logger.info("Saved profile for %s (user_id=%s)", name, self._user_id)
        return f"Profile saved for {name}."

    # ------------------------------------------------------------------
    # Tool 2 — Fetch Practice Question (Day 5)
    # ------------------------------------------------------------------
    @function_tool
    async def fetch_practice_question(
        self,
        topic: str,
        level: str = "beginner",
    ) -> str:
        """
        Fetch a practice question from the local dataset.
        Call this when the student asks for a practice question, exercise,
        or quiz on a topic.
        Available topics: science, math, english.
        Available levels: beginner, intermediate, advanced.
        """
        logger.info(
            "Tool called: fetch_practice_question topic='%s' level='%s'",
            topic,
            level,
        )

        dataset = {
            "science": {
                "beginner": "What do plants need to grow and make their own food?",
                "intermediate": "Can you explain the process of photosynthesis in your own words?",
                "advanced": "How does the absence of sunlight affect the chlorophyll in a plant leaf?",
            },
            "math": {
                "beginner": "If you have 3 apples and buy 4 more, how many apples do you have in total?",
                "intermediate": "What is 15% of 200 rupees?",
                "advanced": "Solve for x: 3x + 12 = 27",
            },
            "english": {
                "beginner": "Can you give me an example of a noun in a sentence?",
                "intermediate": "What is the difference between 'there', 'their', and 'they're'?",
                "advanced": "Can you explain what a metaphor is and give me one example?",
            },
        }

        topic_lower = topic.lower().strip()
        level_lower = level.lower().strip()

        available_topics = ", ".join(dataset.keys())

        if topic_lower not in dataset:
            return (
                f"Failure: No practice question available for '{topic}'. "
                f"Tell the user this topic is not in the dataset and suggest "
                f"trying: {available_topics} (levels: beginner, intermediate, advanced). "
                f"Do NOT invent a question."
            )

        if level_lower not in dataset[topic_lower]:
            available_levels = ", ".join(dataset[topic_lower].keys())
            return (
                f"Failure: No question for level '{level}' in '{topic}'. "
                f"Suggest these levels: {available_levels}. "
                f"Do NOT invent a question."
            )

        question = dataset[topic_lower][level_lower]
        return (
            f"Question: {question}\n"
            f"Source Note: From the hand-built local practice-question "
            f"dataset included with this project (August 2026)."
        )


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}

    await ctx.connect()

    # Wait for the human participant to fully join so we get their
    # stable identity (sent from the browser via localStorage).
    participant = await ctx.wait_for_participant()
    user_id = (
        participant.identity
        if participant and participant.identity
        else ctx.room.name
    )

    logger.info("Session user_id resolved to: %s", user_id)

    # Pre-load the caller profile BEFORE building the system prompt.
    # This is the ONLY place the database is read — the prompt is then
    # assembled with all the personalisation already baked in.
    profile = get_user(user_id)
    if profile and profile.get("name"):
        logger.info(
            "Returning caller detected: name=%s topics=%s",
            profile["name"],
            profile.get("topics_covered"),
        )
    else:
        logger.info("New caller — no profile found for %s", user_id)

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
        agent=Assistant(user_id=user_id, profile=profile),
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
