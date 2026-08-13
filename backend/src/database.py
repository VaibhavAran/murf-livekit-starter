"""
database.py — SQLite persistence layer for caller profiles.

Each caller is stored once keyed by user_id (derived from the LiveKit
participant identity).  Two public async helpers are exposed:

    get_user(user_id)     → dict | None
    save_user(user_data)  → None  (upsert)
"""

import json
import logging
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

logger = logging.getLogger("agent.database")

# Resolve the DB path relative to this file: backend/data/users.db
_DB_DIR = Path(__file__).parent.parent / "data"
_DB_PATH = _DB_DIR / "users.db"


def _ensure_db() -> None:
    """Create the DB directory and table if they do not already exist."""
    _DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(_DB_PATH)
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                user_id             TEXT PRIMARY KEY,
                name                TEXT,
                language_preference TEXT,
                current_level       TEXT,
                topics_covered      TEXT DEFAULT '[]',
                common_mistakes     TEXT DEFAULT '[]',
                last_interaction    TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS escalations (
                ticket_id           TEXT PRIMARY KEY,
                user_id             TEXT,
                caller_name         TEXT,
                reason              TEXT,
                urgency             TEXT,
                summary             TEXT,
                preferred_contact   TEXT,
                status              TEXT DEFAULT 'Open',
                created_at          TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS call_logs (
                call_id             TEXT PRIMARY KEY,
                user_id             TEXT,
                caller_name         TEXT,
                call_type           TEXT,
                duration_seconds    INTEGER,
                exercises_done      INTEGER DEFAULT 0,
                escalation_done     INTEGER DEFAULT 0,
                status              TEXT,
                ended_at            TEXT
            )
            """
        )
        conn.commit()
        logger.info("Database ready at %s", _DB_PATH)
    finally:
        conn.close()


# Initialise on import so the table is always available before any call.
_ensure_db()


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------


def get_user(user_id: str) -> dict | None:
    """
    Look up a caller by user_id.

    Returns a dict with all stored fields, or None if this is a new caller.
    JSON-encoded list columns (topics_covered, common_mistakes) are decoded
    into Python lists automatically.
    """
    conn = sqlite3.connect(_DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE user_id = ?", (user_id,)
        ).fetchone()
        if row is None:
            return None
        data = dict(row)
        # Decode JSON list columns
        for col in ("topics_covered", "common_mistakes"):
            try:
                data[col] = json.loads(data[col] or "[]")
            except (json.JSONDecodeError, TypeError):
                data[col] = []
        return data
    finally:
        conn.close()


def save_user(user_data: dict) -> None:
    """
    Upsert a caller record.

    ``user_data`` should contain at minimum ``user_id``.
    Any missing optional fields default to None / empty list.
    ``last_interaction`` is always overwritten with the current UTC time.
    """
    user_id = user_data.get("user_id")
    if not user_id:
        raise ValueError("user_data must contain a non-empty 'user_id'")

    # Encode list columns to JSON strings
    topics = json.dumps(user_data.get("topics_covered") or [])
    mistakes = json.dumps(user_data.get("common_mistakes") or [])
    now = datetime.now(timezone.utc).isoformat()

    conn = sqlite3.connect(_DB_PATH)
    try:
        conn.execute(
            """
            INSERT INTO users
                (user_id, name, language_preference, current_level,
                 topics_covered, common_mistakes, last_interaction)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                name                = excluded.name,
                language_preference = excluded.language_preference,
                current_level       = excluded.current_level,
                topics_covered      = excluded.topics_covered,
                common_mistakes     = excluded.common_mistakes,
                last_interaction    = excluded.last_interaction
            """,
            (
                user_id,
                user_data.get("name"),
                user_data.get("language_preference"),
                user_data.get("current_level"),
                topics,
                mistakes,
                now,
            ),
        )
        conn.commit()
        logger.info("Saved profile for user_id=%s name=%s", user_id, user_data.get("name"))
    finally:
        conn.close()


def save_escalation(escalation_data: dict) -> str:
    """
    Save a new human escalation ticket.
    Returns the ticket_id.
    """
    ticket_id = escalation_data.get("ticket_id")
    if not ticket_id:
        import random
        ticket_id = f"TICKET-{random.randint(1000, 9999)}"

    now = datetime.now(timezone.utc).isoformat()
    conn = sqlite3.connect(_DB_PATH)
    try:
        conn.execute(
            """
            INSERT INTO escalations
                (ticket_id, user_id, caller_name, reason, urgency, summary, preferred_contact, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                ticket_id,
                escalation_data.get("user_id", "anonymous"),
                escalation_data.get("caller_name", "Student"),
                escalation_data.get("reason", "Teacher assistance requested"),
                escalation_data.get("urgency", "medium"),
                escalation_data.get("summary", ""),
                escalation_data.get("preferred_contact", "voice/phone"),
                escalation_data.get("status", "Open"),
                now,
            ),
        )
        conn.commit()
        logger.info("Created escalation ticket %s for %s", ticket_id, escalation_data.get("caller_name"))
        return ticket_id
    finally:
        conn.close()


def get_escalations() -> list[dict]:
    """
    Retrieve all escalation tickets ordered by newest first.
    """
    conn = sqlite3.connect(_DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        rows = conn.execute("SELECT * FROM escalations ORDER BY created_at DESC").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def save_call_log(log_data: dict) -> None:
    """
    Save a completed call log record.
    """
    import random
    call_id = log_data.get("call_id") or f"CALL-{random.randint(10000, 99999)}"
    now = datetime.now(timezone.utc).isoformat()

    conn = sqlite3.connect(_DB_PATH)
    try:
        conn.execute(
            """
            INSERT INTO call_logs
                (call_id, user_id, caller_name, call_type, duration_seconds, exercises_done, escalation_done, status, ended_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                call_id,
                log_data.get("user_id", "unknown"),
                log_data.get("caller_name", "Student"),
                log_data.get("call_type", "inbound_web"),
                log_data.get("duration_seconds", 0),
                log_data.get("exercises_done", 0),
                log_data.get("escalation_done", 0),
                log_data.get("status", "FAILED"),
                now,
            ),
        )
        conn.commit()
        logger.info("Saved call_log %s status=%s", call_id, log_data.get("status"))
    finally:
        conn.close()


def get_call_analytics() -> dict:
    """
    Retrieve aggregated metrics and list of all logged calls.
    """
    conn = sqlite3.connect(_DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        total_calls = conn.execute("SELECT COUNT(*) FROM call_logs").fetchone()[0]
        successful_calls = conn.execute("SELECT COUNT(*) FROM call_logs WHERE status = 'SUCCESS'").fetchone()[0]
        failed_calls = conn.execute("SELECT COUNT(*) FROM call_logs WHERE status = 'FAILED'").fetchone()[0]

        rows = conn.execute("SELECT * FROM call_logs ORDER BY ended_at DESC").fetchall()
        logs = [dict(r) for r in rows]

        return {
            "total_calls": total_calls,
            "successful_calls": successful_calls,
            "failed_calls": failed_calls,
            "success_rate": round((successful_calls / total_calls * 100), 1) if total_calls > 0 else 0,
            "logs": logs,
        }
    finally:
        conn.close()
