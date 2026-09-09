"""
Purpose: Backend Progress & XP Persistence Router using SQLite.
         Provides deterministic, idempotent XP event recording, game session storage,
         and child progress queries for parent/teacher dashboards.
Module: Backend API
Folder: backend/api
"""

import os
import sqlite3
import time
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Setup SQLite Database Directory & File
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "gyan_progress.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Table 1: Idempotent XP Events
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS xp_events (
        event_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        xp_amount INTEGER NOT NULL,
        created_at INTEGER NOT NULL
    );
    """)

    # Table 2: Complete Learning Sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS game_sessions (
        session_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        game_id TEXT NOT NULL,
        category TEXT,
        age_level INTEGER,
        mother_tongue TEXT,
        learning_language TEXT,
        started_at INTEGER,
        completed_at INTEGER,
        total_questions INTEGER,
        correct_answers INTEGER,
        attempts INTEGER,
        accuracy REAL,
        xp_earned INTEGER,
        created_at INTEGER NOT NULL
    );
    """)

    # Table 3: Child Profiles
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS child_profiles (
        user_id TEXT PRIMARY KEY,
        name TEXT,
        age INTEGER,
        total_xp INTEGER DEFAULT 0,
        current_level INTEGER DEFAULT 1,
        updated_at INTEGER NOT NULL
    );
    """)

    conn.commit()
    conn.close()


# Initialize database schema on load
init_db()


def calculate_level(total_xp: int) -> int:
    level = 1
    accumulated = 0
    cost = 100
    while total_xp >= accumulated + cost:
        accumulated += cost
        level += 1
        cost = 100 + (level - 1) * 50
    return level


# Pydantic Schemas
class XPEventPayload(BaseModel):
    event_id: str
    user_id: str = "default_child"
    session_id: str
    event_type: str
    xp_amount: int
    metadata: Optional[Dict[str, Any]] = None


class SessionPayload(BaseModel):
    session_id: str
    user_id: str = "default_child"
    game_id: str
    category: Optional[str] = None
    age_level: int = 5
    mother_tongue: str = "en"
    learning_language: str = "en"
    started_at: Optional[int] = None
    completed_at: Optional[int] = None
    total_questions: int
    correct_answers: int
    attempts: int
    accuracy: float
    xp_earned: int


@router.post("/event")
def record_xp_event(payload: XPEventPayload):
    """
    Idempotently records an XP event.
    If the event_id has already been processed, returns already_processed=True and awards 0 XP.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    now = int(time.time() * 1000)

    try:
        # Check if already processed
        cursor.execute("SELECT event_id, xp_amount FROM xp_events WHERE event_id = ?", (payload.event_id,))
        existing = cursor.fetchone()

        if existing:
            # Event already processed — strictly prevent duplicate awarding
            cursor.execute("SELECT total_xp, current_level FROM child_profiles WHERE user_id = ?", (payload.user_id,))
            profile = cursor.fetchone()
            total_xp = profile["total_xp"] if profile else 0
            current_level = profile["current_level"] if profile else 1
            conn.close()

            return {
                "success": True,
                "already_processed": True,
                "xp_awarded": 0,
                "total_xp": total_xp,
                "current_level": current_level,
                "message": f"Duplicate event {payload.event_id} ignored.",
            }

        # Insert new unique event
        cursor.execute(
            """
            INSERT INTO xp_events (event_id, user_id, session_id, event_type, xp_amount, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (payload.event_id, payload.user_id, payload.session_id, payload.event_type, payload.xp_amount, now),
        )

        # Update or create child profile
        cursor.execute("SELECT total_xp FROM child_profiles WHERE user_id = ?", (payload.user_id,))
        profile = cursor.fetchone()

        new_total_xp = (profile["total_xp"] if profile else 0) + max(0, payload.xp_amount)
        new_level = calculate_level(new_total_xp)

        if profile:
            cursor.execute(
                "UPDATE child_profiles SET total_xp = ?, current_level = ?, updated_at = ? WHERE user_id = ?",
                (new_total_xp, new_level, now, payload.user_id),
            )
        else:
            cursor.execute(
                "INSERT INTO child_profiles (user_id, name, age, total_xp, current_level, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (payload.user_id, payload.user_id, 5, new_total_xp, new_level, now),
            )

        conn.commit()
        conn.close()

        return {
            "success": True,
            "already_processed": False,
            "xp_awarded": payload.xp_amount,
            "total_xp": new_total_xp,
            "current_level": new_level,
            "event_id": payload.event_id,
        }

    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session")
def record_game_session(payload: SessionPayload):
    """
    Records a completed educational game session.
    Guarantees session-level idempotency via session_id PRIMARY KEY.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    now = int(time.time() * 1000)

    try:
        cursor.execute("SELECT session_id FROM game_sessions WHERE session_id = ?", (payload.session_id,))
        existing = cursor.fetchone()
        if existing:
            conn.close()
            return {
                "success": True,
                "already_recorded": True,
                "session_id": payload.session_id,
                "message": "Session already recorded.",
            }

        cursor.execute(
            """
            INSERT INTO game_sessions (
                session_id, user_id, game_id, category, age_level, mother_tongue,
                learning_language, started_at, completed_at, total_questions,
                correct_answers, attempts, accuracy, xp_earned, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.session_id,
                payload.user_id,
                payload.game_id,
                payload.category,
                payload.age_level,
                payload.mother_tongue,
                payload.learning_language,
                payload.started_at or (now - 60000),
                payload.completed_at or now,
                payload.total_questions,
                payload.correct_answers,
                payload.attempts,
                payload.accuracy,
                payload.xp_earned,
                now,
            ),
        )

        conn.commit()
        conn.close()

        return {
            "success": True,
            "already_recorded": False,
            "session_id": payload.session_id,
        }

    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
@router.get("/summary/{user_id}")
def get_progress_summary(user_id: Optional[str] = "default_child"):
    """
    Returns the lifetime progress and XP summary for a specific child profile.
    """
    target_user_id = user_id or "default_child"
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT total_xp, current_level FROM child_profiles WHERE user_id = ?", (target_user_id,))
    profile = cursor.fetchone()

    total_xp = profile["total_xp"] if profile else 0
    current_level = profile["current_level"] if profile else 1

    cursor.execute("SELECT COUNT(*) as count FROM game_sessions WHERE user_id = ?", (target_user_id,))
    sessions_count = cursor.fetchone()["count"]

    conn.close()

    return {
        "user_id": target_user_id,
        "total_xp": total_xp,
        "current_level": current_level,
        "completed_sessions_count": sessions_count,
    }


@router.get("/sessions/{user_id}")
def get_user_sessions(user_id: str, limit: int = 50):
    """
    Returns recent learning sessions for a specific child for parent/teacher dashboards.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM game_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
        (user_id, limit),
    )
    rows = cursor.fetchall()
    conn.close()

    sessions = [dict(row) for row in rows]
    return {
        "user_id": user_id,
        "total": len(sessions),
        "sessions": sessions,
    }


@router.get("/dashboard/{user_id}")
def get_parent_dashboard(user_id: str):
    """
    Returns full progress summary and learning sessions for parent/teacher dashboards.
    """
    summary = get_progress_summary(user_id)
    sessions = get_user_sessions(user_id)
    return {
        "user_id": user_id,
        "summary": summary,
        "sessions": sessions["sessions"],
    }


@router.post("/reset/{user_id}")
def reset_user_progress(user_id: str):
    """
    Resets progress for a specific child (used for testing or profile reset).
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM xp_events WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM game_sessions WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM child_profiles WHERE user_id = ?", (user_id,))

    conn.commit()
    conn.close()

    return {"success": True, "message": f"Reset progress for user {user_id}"}
