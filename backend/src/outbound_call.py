"""
outbound_call.py — Trigger an Outbound Call (Day 6 Challenge)

Reads configuration dynamically from environment variables (.env.local) or CLI args.
Automatically formats destination for LiveKit SIP API.
"""

import argparse
import asyncio
import logging
import os
import sys

from dotenv import load_dotenv
from livekit import api

load_dotenv(".env.local")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("outbound_call")


def sanitize_sip_user(target: str) -> str:
    """
    Format SIP destination for LiveKit SIP API.
    LiveKit expects just the SIP user (e.g. 'vaibhav_aran00') or phone number,
    not the full URI (e.g. 'sip:vaibhav_aran00@sip.linphone.org').
    """
    cleaned = target.strip()
    if cleaned.startswith("sip:"):
        cleaned = cleaned[4:]
    if "@" in cleaned:
        cleaned = cleaned.split("@")[0]
    return cleaned


async def make_outbound_call(
    sip_uri: str | None,
    phone_number: str | None,
    trunk_id: str | None,
    room_name: str | None,
):
    url = os.getenv("LIVEKIT_URL")
    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    agent_name = os.getenv("AGENT_NAME", "my-agent")

    # Read SIP trunk ID from env
    sip_trunk_id = (
        trunk_id
        or os.getenv("LIVEKIT_SIP_OUTBOUND_TRUNK_ID")
        or os.getenv("SIP_TRUNK_ID")
    )

    # Read target destination from env
    target_sip = (
        sip_uri
        or os.getenv("LINPHONE_SIP_URI")
        or os.getenv("SIP_OUTBOUND_ADDRESS")
    )

    if not url or not api_key or not api_secret:
        logger.error(
            "LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET must be set"
        )
        sys.exit(1)

    raw_destination = phone_number or target_sip
    if not sip_trunk_id or not raw_destination:
        logger.error("Could not resolve SIP trunk or destination from .env.local")
        sys.exit(1)

    destination = sanitize_sip_user(raw_destination)

    lk_api = api.LiveKitAPI(url=url, api_key=api_key, api_secret=api_secret)

    target_room = room_name or f"outbound_room_{os.urandom(4).hex()}"
    target_identity = f"outbound_{os.urandom(4).hex()}"

    # ── Step 1: Create the room ──────────────────────────────────────
    logger.info("Creating room '%s'...", target_room)
    try:
        await lk_api.room.create_room(
            api.CreateRoomRequest(name=target_room)
        )
        logger.info("Room '%s' created.", target_room)
    except Exception as e:
        logger.warning("Room note: %s", e)

    # ── Step 2: Dispatch the agent worker into the room ──────────────
    # Without this, the agent_name="my-agent" worker will never join
    # the room and the SIP caller will hear silence.
    logger.info("Dispatching agent '%s' to room '%s'...", agent_name, target_room)
    try:
        await lk_api.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(
                agent_name=agent_name,
                room=target_room,
            )
        )
        logger.info("Agent '%s' dispatched successfully.", agent_name)
    except Exception as e:
        logger.error("Failed to dispatch agent: %s", e)
        await lk_api.aclose()
        sys.exit(1)

    # ── Step 3: Add the SIP participant (triggers the phone ring) ────
    logger.info(
        "Calling '%s' via SIP trunk '%s'...", destination, sip_trunk_id
    )
    try:
        sip_request = api.CreateSIPParticipantRequest(
            sip_trunk_id=sip_trunk_id,
            sip_call_to=destination,
            room_name=target_room,
            participant_identity=target_identity,
            participant_name="Outbound Learner",
        )
        participant = await lk_api.sip.create_sip_participant(sip_request)
        logger.info(
            "Call dispatched! Participant: %s", participant.participant_id
        )
    except Exception as e:
        logger.error("Failed to dispatch SIP call: %s", e)

    await lk_api.aclose()


def main():
    parser = argparse.ArgumentParser(
        description="Trigger an Outbound SIP Call (Day 6)"
    )
    parser.add_argument("--phone", type=str, help="Phone number to call")
    parser.add_argument("--sip", type=str, help="SIP user or URI")
    parser.add_argument("--trunk", type=str, help="LiveKit SIP Trunk ID")
    parser.add_argument("--room", type=str, help="Room name (optional)")
    args = parser.parse_args()
    asyncio.run(make_outbound_call(args.sip, args.phone, args.trunk, args.room))


if __name__ == "__main__":
    main()
