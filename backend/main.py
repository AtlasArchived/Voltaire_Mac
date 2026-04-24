"""
main.py
Voltaire — FastAPI Backend

Replaces app.py. All Python logic unchanged.
This file just wraps it in HTTP endpoints for the React frontend.

Run: uvicorn main:app --reload --port 8000
"""

import os
import sys
import logging
import asyncio
import time
from pathlib import Path

# Add the project root to path so all existing .py files are importable.
# Works whether main.py is in C:\voltaire\ or C:\voltaire\backend\
_here = Path(__file__).parent
_root = _here.parent if _here.name == 'backend' else _here
sys.path.insert(0, str(_root))
# Also add current dir
sys.path.insert(0, str(_here))

from fastapi import FastAPI, HTTPException, BackgroundTasks, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import json

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Voltaire API", version="2.0")

# Allow React dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.0.13:3000",
                   "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response models ───────────────────────────────────────────────────

class AnswerRequest(BaseModel):
    user_input:   str
    session_id:   Optional[str] = None
    mode:         str = "study"
    history:      list = []   # [{role: "assistant"|"user", text: "..."}]

class MathieuRequest(BaseModel):
    message:      str
    history:      list = []

class VoiceRequest(BaseModel):
    transcript:   str
    context:      str = "conversation"

class OnboardingRequest(BaseModel):
    name:         str
    goal:         str
    daily_xp:     int = 50
    placement_score: int = 0

class TTSRequest(BaseModel):
    text:         str
    slow:         bool = True
    voice:        Optional[str] = None

class ReviewAnswerRequest(BaseModel):
    vocab_id:     int
    outcome:      float   # 0.0, 0.5, or 1.0

class SettingRequest(BaseModel):
    key:   str
    value: str

class ArrangeFeedbackRequest(BaseModel):
    user_answer: str
    correct_answer: str
    prompt: str = ""

class AdaptiveEventRequest(BaseModel):
    q_type: str
    cefr: str = "A1"
    skill_tag: str = "general"
    prompt: str
    correct: bool
    response_ms: int = 0
    user_answer: str = ""
    expected_answer: str = ""

class LearnProgressRequest(BaseModel):
    correct: bool
    mode: str = "learn"

class C1StatusResponse(BaseModel):
    elo: int
    target_elo: int
    pct_to_c1: int
    mastery_score: float
    streak: int
    readiness: bool
    recommendation: str

class CefrCheckpointResponse(BaseModel):
    level: str
    passed: bool
    score_pct: int
    required_pct: int
    recommendation: str

class CheckpointSubmitRequest(BaseModel):
    score_pct: Optional[int] = None

class AiMistakeFeedbackRequest(BaseModel):
    q_type: str
    cefr: str
    prompt: str
    user_answer: str
    expected_answer: str
    note: str = ""


# ── Helpers ───────────────────────────────────────────────────────────────────

def _groq_key() -> str:
    return os.getenv("GROQ_API_KEY", "")

def _safe(func, *args, fallback=None, **kwargs):
    try:
        return func(*args, **kwargs)
    except Exception as exc:
        log.error("API error in %s: %s", func.__name__, exc)
        return fallback


def _ensure_core_db() -> None:
    """
    Ensure the minimum schema exists so onboarding can complete.
    Migrations run via ALTER TABLE so existing data is preserved.
    """
    import sqlite3
    with sqlite3.connect("cato_mind.db") as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS learner (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL DEFAULT 'Learner',
                elo INTEGER NOT NULL DEFAULT 800,
                xp INTEGER NOT NULL DEFAULT 0,
                unit_level INTEGER NOT NULL DEFAULT 1
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS streak_state (
                id INTEGER PRIMARY KEY,
                daily_goal_xp   INTEGER NOT NULL DEFAULT 50,
                current_streak  INTEGER NOT NULL DEFAULT 0,
                longest_streak  INTEGER NOT NULL DEFAULT 0,
                last_active_date TEXT,
                xp_today        INTEGER NOT NULL DEFAULT 0,
                xp_today_date   TEXT
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS lesson_log (
                id                INTEGER PRIMARY KEY AUTOINCREMENT,
                finished_at       TEXT NOT NULL DEFAULT (datetime('now')),
                unit_id           TEXT NOT NULL DEFAULT 'general',
                cefr              TEXT NOT NULL DEFAULT 'A1',
                questions_answered INTEGER NOT NULL DEFAULT 0,
                accuracy_pct      INTEGER NOT NULL DEFAULT 0,
                xp_earned         INTEGER NOT NULL DEFAULT 0
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS adaptive_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                q_type TEXT NOT NULL,
                cefr TEXT NOT NULL DEFAULT 'A1',
                skill_tag TEXT NOT NULL DEFAULT 'general',
                prompt TEXT NOT NULL,
                correct INTEGER NOT NULL,
                response_ms INTEGER NOT NULL DEFAULT 0,
                user_answer TEXT,
                expected_answer TEXT
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS completed_units (
                unit_id      TEXT PRIMARY KEY,
                kind         TEXT NOT NULL DEFAULT 'unit',
                completed_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)
        db.execute(
            "INSERT OR IGNORE INTO learner (id, name, elo, xp, unit_level) VALUES (1, 'Learner', 800, 0, 1)"
        )
        db.execute(
            "INSERT OR IGNORE INTO streak_state (id, daily_goal_xp) VALUES (1, 50)"
        )
        # Migrate adaptive_events
        cols = {r[1] for r in db.execute("PRAGMA table_info(adaptive_events)").fetchall()}
        if "cefr" not in cols:
            db.execute("ALTER TABLE adaptive_events ADD COLUMN cefr TEXT NOT NULL DEFAULT 'A1'")
        if "skill_tag" not in cols:
            db.execute("ALTER TABLE adaptive_events ADD COLUMN skill_tag TEXT NOT NULL DEFAULT 'general'")
        # Migrate streak_state — add new columns if coming from old schema
        scols = {r[1] for r in db.execute("PRAGMA table_info(streak_state)").fetchall()}
        if "current_streak" not in scols:
            db.execute("ALTER TABLE streak_state ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0")
        if "longest_streak" not in scols:
            db.execute("ALTER TABLE streak_state ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0")
        if "last_active_date" not in scols:
            db.execute("ALTER TABLE streak_state ADD COLUMN last_active_date TEXT")
        if "xp_today" not in scols:
            db.execute("ALTER TABLE streak_state ADD COLUMN xp_today INTEGER NOT NULL DEFAULT 0")
        if "xp_today_date" not in scols:
            db.execute("ALTER TABLE streak_state ADD COLUMN xp_today_date TEXT")


def _get_learner_elo() -> int:
    _ensure_core_db()
    import sqlite3
    with sqlite3.connect("cato_mind.db") as db:
        row = db.execute("SELECT elo FROM learner WHERE id=1").fetchone()
    return int(row[0]) if row else 800


def _lesson_state_from_elo(elo: int) -> dict:
    if elo >= 1800:
        cefr = "C2"
    elif elo >= 1600:
        cefr = "C1"
    elif elo >= 1400:
        cefr = "B2"
    elif elo >= 1200:
        cefr = "B1"
    elif elo >= 1000:
        cefr = "A2"
    else:
        cefr = "A1"
    return {
        "cefr": cefr,
        "grammar": "",
        "theme": "",
        "skill": "",
        "lesson_count": 0,
        "last_summary": "",
        "needs_review": [],
        "elo": elo,
    }


def _skill_tag_for(q_type: str, prompt: str) -> str:
    p = (prompt or "").lower()
    if q_type == "arrange":
        return "syntax"
    if q_type == "listen":
        return "listening"
    if q_type == "translate":
        return "lexicon"
    if "subjunctive" in p or "grammar" in p:
        return "grammar"
    return "grammar" if q_type == "mcq" else "general"


def _adaptive_profile(limit: int = 250):
    import sqlite3
    _ensure_core_db()
    with sqlite3.connect("cato_mind.db") as db:
        rows = db.execute(
            """
            SELECT q_type, prompt, correct, response_ms
            FROM adaptive_events
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    total = len(rows)
    if total == 0:
        return {
            "mastery_score": 0.0,
            "streak": 0,
            "weak_types": [],
            "focus_prompts": [],
            "recommendation": "Start a few lessons so Voltaire can personalize your training.",
        }

    # oldest -> newest for streak and trend calculations
    rows = list(reversed(rows))
    correct_ratio = sum(1 for r in rows if r[2]) / max(total, 1)
    avg_ms = sum(max(int(r[3] or 0), 0) for r in rows) / max(total, 1)

    streak = 0
    for r in reversed(rows):
        if r[2]:
            streak += 1
        else:
            break

    by_type = {}
    by_prompt = {}
    for q_type, prompt, correct, _ms in rows:
        t = by_type.setdefault(q_type, {"total": 0, "wrong": 0})
        t["total"] += 1
        if not correct:
            t["wrong"] += 1

        p = by_prompt.setdefault(prompt, {"total": 0, "wrong": 0, "q_type": q_type})
        p["total"] += 1
        if not correct:
            p["wrong"] += 1

    weak_types = sorted(
        [
            {
                "q_type": t,
                "error_rate": round(v["wrong"] / max(v["total"], 1), 3),
                "attempts": v["total"],
            }
            for t, v in by_type.items()
            if v["total"] >= 2 and v["wrong"] > 0
        ],
        key=lambda x: (-x["error_rate"], -x["attempts"]),
    )[:3]

    focus_prompts = sorted(
        [
            {
                "prompt": p,
                "q_type": v["q_type"],
                "error_rate": round(v["wrong"] / max(v["total"], 1), 3),
                "attempts": v["total"],
            }
            for p, v in by_prompt.items()
            if v["wrong"] > 0
        ],
        key=lambda x: (-x["error_rate"], -x["attempts"]),
    )[:6]

    speed_factor = 1.0 if avg_ms <= 0 else max(0.65, min(1.0, 12000 / max(avg_ms, 4000)))
    mastery = round(max(0.0, min(1.0, correct_ratio * speed_factor)) * 100, 1)

    recommendation = "Keep momentum with mixed drills."
    if weak_types:
        top = weak_types[0]["q_type"]
        recommendation = f"Focus on {top} drills next; aim for 3 correct in a row."
    if mastery >= 85 and streak >= 5:
        recommendation = "Great momentum. Increase difficulty with more translate and listen drills."

    return {
        "mastery_score": mastery,
        "streak": streak,
        "weak_types": weak_types,
        "focus_prompts": focus_prompts,
        "recommendation": recommendation,
    }


# Bilingual tutor system instruction — French for practice, English for explanations/corrections.
VOLTAIRE_FRENCH_ONLY_SYSTEM = """

You are Voltaire, a warm, patient, and encouraging AI French tutor. Your goal is to help an English-speaking student (currently at an A2 level) improve through natural, supportive conversation. Your tone is that of a friendly young Parisian who studied in London: intellectual yet accessible, truthful, and genuinely enthusiastic about sharing French culture.

CONVERSATIONAL RULES
Default Language: Speak in French as much as possible. Use simple vocabulary, present tense, and basic past tenses (passé composé) appropriate for an A2 learner.

When to Switch to English: Automatically switch to English only if:
- The student makes a grammar, spelling, or vocabulary mistake.
- The student asks a question in English.
- The student expresses confusion or frustration.

Correction Structure: When the student makes a mistake, address it immediately using this three-part format:
1. Explanation: A brief, clear English explanation of the error.
2. Correction: The corrected French sentence in italics.
3. Engagement: A follow-up question or comment in French to keep the conversation moving.

PERSONA & TONE
Encouraging: Celebrate progress. Use phrases like "C'est une excellente question !" or "Très bien !"
Cultural Guide: Occasionally sprinkle in brief historical or cultural notes about France (e.g., a specific café habit in Paris or a fact about the French Revolution) to add depth to the lesson.
Intellectual & Clear: Avoid robotic or overly formal language; stick to standard, elegant French and English.
Proactive: If the conversation stalls, suggest a topic like travel, sports, daily life, or French culture.

EXAMPLE INTERACTION
Student: "J'ai mangé un pomme."
Voltaire: "In French, 'pomme' is a feminine noun, so we use 'une' instead of 'un'.
*J'ai mangé une pomme.*
Quelle est ta façon préférée de manger les pommes ?"

GUIDING PRINCIPLE
Maintain the flow of a real conversation. You are not a robot; you are a mentor. If the student is struggling, simplify your French, but never stop being their partner in learning.
"""


def _fallback_tutor_reply(user_text: str, persona: str = "voltaire") -> str:
    text = (user_text or "").strip()
    if persona == "mathieu":
        return (
            "Let's keep going! Tell me a sentence about your day in French "
            "and I'll gently correct anything that needs fixing."
        )
    if not text:
        return (
            "Bonjour! I'm Voltaire, your French tutor. "
            "I'll practice French conversation with you and explain any mistakes in English. "
            "Let's start — tell me how your day is going, in French if you can: "
            "*Comment se passe ta journée ?*"
        )
    return (
        f"Good effort! A more natural way to say that would be: *\"{text}\"*. "
        "Try building on that — can you add one more detail in French?"
    )


def _ai_json_or_none(prompt: str):
    try:
        from gpu_router import route_and_call
        result = route_and_call(prompt, gemini_api_key=_gemini_key())
        txt = (result or {}).get("text", "").strip()
        if not txt:
            return None
        return json.loads(txt)
    except Exception:
        return None


def _checkpoint_required_pct(level: str) -> int:
    req = {"A1": 55, "A2": 62, "B1": 70, "B2": 76, "C1": 82, "C2": 88}
    return req.get(level, 70)


def _recent_accuracy(limit: int = 40):
    import sqlite3
    _ensure_core_db()
    with sqlite3.connect("cato_mind.db") as db:
        rows = db.execute(
            "SELECT correct FROM adaptive_events ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    total = len(rows)
    if total == 0:
        return 0.0, 0
    correct = sum(1 for r in rows if int(r[0]) == 1)
    return (correct / total), total


def _load_checkpoints():
    import sqlite3
    _ensure_core_db()
    out = {}
    with sqlite3.connect("cato_mind.db") as db:
        rows = db.execute(
            "SELECT key, value FROM app_settings WHERE key LIKE 'checkpoint_%'"
        ).fetchall()
    for k, v in rows:
        out[k.replace("checkpoint_", "").upper()] = (v == "passed")
    return out


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "2.0"}


# ── Learner ───────────────────────────────────────────────────────────────────

@app.get("/api/learner")
def get_learner():
    try:
        import sqlite3
        with sqlite3.connect("cato_mind.db") as db:
            r = db.execute(
                "SELECT name, elo, xp, unit_level FROM learner LIMIT 1"
            ).fetchone()
        if not r:
            raise HTTPException(status_code=404, detail="Learner not found. Run init_db.py first.")
        return {"name": r[0], "elo": r[1], "xp": r[2], "unit": r[3]}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/streak")
def get_streak():
    try:
        from streak import get_streak_state, get_weekly_summary
        state  = get_streak_state()
        weekly = get_weekly_summary()
        return {**state, "weekly": weekly}
    except Exception as exc:
        log.warning("Streak error: %s", exc)
    # Fallback: read directly from streak_state table
    try:
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            ss = db.execute(
                "SELECT daily_goal_xp, current_streak, longest_streak, xp_today FROM streak_state WHERE id=1"
            ).fetchone()
        if ss:
            goal_xp, cur, longest, xp_today = ss
            goal_pct = min(100, int((xp_today / max(goal_xp, 1)) * 100))
            return {"current_streak": cur, "longest_streak": longest,
                    "xp_today": xp_today, "daily_goal_xp": goal_xp,
                    "goal_pct": goal_pct, "streak_freezes": 0, "weekly": []}
    except Exception:
        pass
    return {"current_streak": 0, "xp_today": 0, "daily_goal_xp": 50,
            "goal_pct": 0, "streak_freezes": 0, "weekly": []}


@app.get("/api/due-count")
def get_due_count():
    try:
        from spaced_repetition import get_due_count
        return {"count": get_due_count()}
    except Exception:
        return {"count": 0}


# ── Lesson ────────────────────────────────────────────────────────────────────

@app.get("/api/lesson/state")
def get_lesson_state():
    try:
        from curriculum import load_thread, cefr_from_elo
        from lesson_engine import get_unlocked_units
        import sqlite3
        thread  = load_thread()
        with sqlite3.connect("cato_mind.db") as db:
            learner = db.execute("SELECT elo FROM learner LIMIT 1").fetchone()
        elo = learner[0] if learner else 800
        return {
            "cefr":           thread.cefr_level,
            "grammar":        thread.current_grammar,
            "theme":          thread.current_theme,
            "skill":          thread.current_skill,
            "lesson_count":   thread.lesson_count,
            "last_summary":   thread.last_lesson_summary,
            "needs_review":   thread.needs_review,
            "elo":            elo,
        }
    except Exception:
        return _lesson_state_from_elo(_get_learner_elo())


@app.post("/api/lesson/start")
async def start_lesson():
    """Start a lesson — returns first Voltaire message via Groq."""
    try:
        from groq import Groq
        client = Groq(api_key=_groq_key())
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": VOLTAIRE_FRENCH_ONLY_SYSTEM},
                {"role": "user",   "content": (
                    "Start the lesson. Greet the student warmly in French, "
                    "ask them a simple conversational question to get started, "
                    "and keep it to 2–3 sentences."
                )},
            ],
            temperature=0.8,
            max_tokens=200,
        )
        text = resp.choices[0].message.content.strip()
        return {"text": text, "annotated": text, "backend": "groq", "session_id": "groq-session"}
    except Exception as exc:
        logging.warning(f"lesson/start Groq error: {exc}")
        text = _fallback_tutor_reply("")
        return {"text": text, "annotated": text, "backend": "fallback", "session_id": "local-fallback"}


@app.post("/api/lesson/answer")
async def answer_lesson(req: AnswerRequest):
    """Submit an answer and get Voltaire's response. Streaming."""
    try:
        from curriculum import (load_thread, save_thread, build_voltaire_system_prompt,
                                 update_thread_from_response, check_level_promotion)
        from gpu_router import route_and_call
        from lesson_engine import annotate_text
        from context_manager import (load_chat_history, save_chat_history,
                                      maybe_compress, log_tokens, estimate_tokens)

        thread  = load_thread()
        sys_p   = build_voltaire_system_prompt(800, thread) + VOLTAIRE_FRENCH_ONLY_SYSTEM
        result  = route_and_call(req.user_input, system=sys_p,
                                  gemini_api_key=_gemini_key())
        annotated = annotate_text(result["text"])

        thread = update_thread_from_response(thread, result["text"], req.user_input, 0.5)
        promotion = check_level_promotion(800, thread)
        if promotion:
            thread.level_up(promotion)
            save_thread(thread)
            return {
                "text":      result["text"],
                "annotated": annotated,
                "backend":   result.get("backend", "unknown"),
                "levelup":   promotion,
            }

        save_thread(thread)
        return {
            "text":      result["text"],
            "annotated": annotated,
            "backend":   result.get("backend", "unknown"),
            "levelup":   None,
        }
    except Exception:
        text = _fallback_tutor_reply(req.user_input)
        return {
            "text": text,
            "annotated": text,
            "backend": "fallback",
            "levelup": None,
        }


@app.post("/api/lesson/answer/stream")
async def answer_lesson_stream(req: AnswerRequest):
    """
    Streaming tutor response via Groq.
    Passes the full conversation history as proper chat messages so Voltaire
    has context, then streams token-by-token using Groq's native streaming.
    """
    async def generate():
        try:
            import concurrent.futures
            from groq import Groq

            key = _groq_key()
            if not key:
                raise ValueError("GROQ_API_KEY not set")

            # Build messages: system + conversation history + new user message
            messages: list[dict] = [
                {"role": "system", "content": VOLTAIRE_FRENCH_ONLY_SYSTEM}
            ]
            for msg in req.history[-20:]:
                role = "assistant" if msg.get("role") == "assistant" else "user"
                text = str(msg.get("text") or msg.get("content") or "").strip()
                if text:
                    messages.append({"role": role, "content": text})
            messages.append({"role": "user", "content": req.user_input})

            # Groq streaming runs synchronously — offload to thread pool
            loop = asyncio.get_event_loop()

            def _stream_groq():
                client = Groq(api_key=key)
                return client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    temperature=0.75,
                    max_tokens=500,
                    stream=True,
                )

            with concurrent.futures.ThreadPoolExecutor() as pool:
                stream = await loop.run_in_executor(pool, _stream_groq)

            # Collect chunks from the sync iterator in a thread
            def _collect(s):
                parts = []
                for chunk in s:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        parts.append(delta.content)
                return parts

            with concurrent.futures.ThreadPoolExecutor() as pool:
                tokens = await loop.run_in_executor(pool, _collect, stream)

            for tok in tokens:
                yield f"data: {json.dumps({'token': tok})}\n\n"
                await asyncio.sleep(0.008)

            yield "data: [DONE]\n\n"

        except Exception as exc:
            logging.warning(f"Tutor stream error: {exc}")
            text = _fallback_tutor_reply(req.user_input)
            for i, word in enumerate(text.split(" ")):
                token = word if i == len(text.split(" ")) - 1 else word + " "
                yield f"data: {json.dumps({'token': token})}\n\n"
                await asyncio.sleep(0.01)
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ── Mathieu ───────────────────────────────────────────────────────────────────

@app.get("/api/mathieu/state")
def get_mathieu_state():
    try:
        from mathieu import load_memory, load_mathieu_chat, refresh_mathieu_daily
        mem  = load_memory()
        mem  = refresh_mathieu_daily(mem)
        chat = load_mathieu_chat(limit=30)
        return {
            "memory":  {"conversations": mem.conversations_had,
                        "hometown": mem.jackson_hometown,
                        "topics": mem.topics_discussed,
                        "last_topic": mem.last_topic,
                        "mood": mem.mathieu_mood_today,
                        "special": mem.cafe_special_today,
                        "freezes": mem.streak_freezes if hasattr(mem,'streak_freezes') else 0},
            "history": chat,
        }
    except Exception:
        return {
            "memory": {
                "conversations": 0,
                "hometown": "",
                "topics": [],
                "last_topic": "",
                "mood": "jovial",
                "special": "Cafe creme",
                "freezes": 0,
            },
            "history": [],
        }


@app.post("/api/mathieu/chat")
async def mathieu_chat(req: MathieuRequest):
    try:
        from mathieu import (load_memory, save_memory, build_mathieu_system_prompt,
                              save_mathieu_message, update_memory_from_conversation,
                              refresh_mathieu_daily)
        from gpu_router import route_and_call
        from curriculum import load_thread

        mem    = load_memory()
        mem    = refresh_mathieu_daily(mem)
        thread = load_thread()
        sys_p  = build_mathieu_system_prompt(thread.cefr_level, mem, 800)
        result = route_and_call(req.message, system=sys_p, gemini_api_key=_gemini_key())

        save_mathieu_message("user", req.message)
        save_mathieu_message("assistant", result["text"])
        mem = update_memory_from_conversation(mem, req.message, result["text"])
        save_memory(mem)

        return {"text": result["text"], "backend": result.get("backend")}
    except Exception:
        return {"text": _fallback_tutor_reply(req.message, persona="mathieu"), "backend": "fallback"}


@app.post("/api/mathieu/start")
async def mathieu_start():
    try:
        from mathieu import (load_memory, save_memory, build_mathieu_system_prompt,
                              build_opening_message, save_mathieu_message,
                              refresh_mathieu_daily)
        from gpu_router import route_and_call
        from curriculum import load_thread

        mem    = load_memory()
        mem    = refresh_mathieu_daily(mem)
        thread = load_thread()
        sys_p  = build_mathieu_system_prompt(thread.cefr_level, mem, 800)
        opening = build_opening_message(mem, thread.cefr_level)
        result  = route_and_call(opening, system=sys_p, gemini_api_key=_gemini_key())

        save_mathieu_message("assistant", result["text"])
        mem.conversations_had += 1
        save_memory(mem)

        return {"text": result["text"]}
    except Exception:
        return {"text": "Salut, je suis Mathieu. On parle en francais tranquillement. Tu veux commencer par quoi ?"}


@app.delete("/api/mathieu/history")
def clear_mathieu():
    try:
        from mathieu import clear_mathieu_chat
        clear_mathieu_chat()
        return {"ok": True}
    except Exception:
        return {"ok": True}


# ── Voice ─────────────────────────────────────────────────────────────────────

@app.post("/api/voice/respond")
async def voice_respond(req: VoiceRequest):
    """
    Process a voice transcript and return Voltaire's spoken response.
    Frontend sends transcript from Web Speech API,
    backend returns text + audio bytes.
    """
    try:
        from curriculum import load_thread, build_voltaire_system_prompt
        from gpu_router import route_and_call
        from tts_engine import synthesise
        from onboarding import get_setting

        thread  = load_thread()
        voice_sys = build_voltaire_system_prompt(800, thread) + VOLTAIRE_FRENCH_ONLY_SYSTEM

        # Add voice-specific instruction (French only — aligns with tutor)
        voice_sys += (
            "\n\nTu réponds à une entrée ORALE. "
            "Réponse courte et naturelle — 2 à 4 phrases maximum. "
            "Pas de markdown ni de listes. "
            "Termine par une question pour poursuivre la conversation. "
            "Français uniquement."
        )

        result = route_and_call(req.transcript, system=voice_sys,
                                 gemini_api_key=_gemini_key())
        text   = result["text"]

        # Generate TTS
        voice    = get_setting("tts_voice", "fr-FR-DeniseNeural")
        audio    = synthesise(text, voice=voice, slow=False)

        if audio:
            import base64
            audio_b64 = base64.b64encode(audio).decode("utf-8")
        else:
            audio_b64 = None

        return {
            "text":      text,
            "audio_b64": audio_b64,
            "backend":   result.get("backend"),
        }
    except Exception:
        text = _fallback_tutor_reply(req.transcript)
        return {
            "text": text,
            "audio_b64": None,
            "backend": "fallback",
        }


# ── TTS ───────────────────────────────────────────────────────────────────────

@app.post("/api/tts")
async def tts(req: TTSRequest):
    try:
        from tts_engine import synthesise
        from onboarding import get_setting
        voice = req.voice or get_setting("tts_voice", "fr-FR-DeniseNeural")
        audio = synthesise(req.text, voice=voice, slow=req.slow)
        if not audio:
            raise HTTPException(status_code=500, detail="TTS failed")
        return StreamingResponse(iter([audio]), media_type="audio/mpeg")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Review / SR ───────────────────────────────────────────────────────────────

@app.get("/api/review/cards")
def get_review_cards(limit: int = 20):
    try:
        from spaced_repetition import get_due_words
        return {"cards": get_due_words(limit=limit)}
    except Exception:
        return {"cards": []}


@app.post("/api/review/answer")
def submit_review(req: ReviewAnswerRequest):
    try:
        from spaced_repetition import record_review
        from elo_engine import record_answer, open_session
        record_review(req.vocab_id, req.outcome)
        sid    = open_session("review")
        result = record_answer(sid, str(req.vocab_id), "", "", req.outcome, 2, "review")
        return {"elo_delta": result.get("elo_delta", 0)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Drill ─────────────────────────────────────────────────────────────────────

@app.get("/api/drill/questions")
def get_drill_questions(n: int = 10):
    try:
        from question_engine import build_question_set, get_error_themes
        from curriculum import load_thread
        thread  = load_thread()
        errors  = get_error_themes()
        qs      = build_question_set(thread.cefr_level, 800, n=n, error_themes=errors)
        return {"questions": [
            {"q_type":    q.q_type, "french": q.french, "english": q.english,
             "prompt":    q.prompt, "answer":  q.answer, "options": q.options,
             "word_bank": q.word_bank, "note":    q.note,
             "audio_text":q.audio_text, "cefr":   q.cefr, "theme":  q.theme}
            for q in qs
        ]}
    except Exception:
        return {"questions": []}


@app.post("/api/drill/arrange-feedback")
async def arrange_feedback(req: ArrangeFeedbackRequest):
    """
    Give fast correction/explanation for sentence-order errors via Groq.
    """
    import re as _re
    corrected = req.correct_answer.strip()
    user = req.user_answer.strip()
    if not corrected:
        return {"corrected": corrected, "explanation": "Use subject + verb + complements in French word order."}
    try:
        from groq import Groq
        client = Groq(api_key=_groq_key())
        prompt = (
            "You are a concise French tutor. A student arranged words in the wrong order.\n"
            "Return ONLY valid JSON with keys: corrected, explanation.\n"
            "Rules: explanation must be 1-2 clear English sentences about the specific word-order or grammar mistake. "
            "Keep language beginner-friendly.\n\n"
            f"Exercise prompt: {req.prompt}\n"
            f"Student's answer: {user}\n"
            f"Correct answer: {corrected}\n"
        )
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1, max_tokens=180,
        )
        txt = resp.choices[0].message.content.strip()
        txt = _re.sub(r'^```(?:json)?\s*', '', txt)
        txt = _re.sub(r'\s*```$', '', txt)
        data = json.loads(txt)
        return {
            "corrected": str(data.get("corrected", corrected)).strip() or corrected,
            "explanation": str(data.get("explanation", "")).strip(),
        }
    except Exception as exc:
        logging.warning(f"arrange-feedback Groq error: {exc}")
        return {
            "corrected": corrected,
            "explanation": "Word order is off. In French, keep the verb right after the subject and place negation as ne…pas around the verb.",
        }


@app.post("/api/ai/mistake-feedback")
def ai_mistake_feedback(req: AiMistakeFeedbackRequest):
    """
    Universal mistake feedback for any exercise mode via Groq.
    Returns a specific English explanation + corrected answer + next step.
    """
    import re as _re
    try:
        from groq import Groq
        client = Groq(api_key=_groq_key())
        prompt = (
            "You are a French language tutor. A student made a mistake on a French exercise.\n"
            "Return ONLY valid JSON (no markdown) with exactly these keys: corrected, explanation, next_step.\n"
            "Rules:\n"
            "- corrected: the correct French sentence or word\n"
            "- explanation: 1-2 clear English sentences explaining the SPECIFIC mistake "
            "(e.g. wrong verb conjugation, wrong gender, missing accent, wrong word order). "
            "Be specific — name the exact grammar rule broken.\n"
            "- next_step: 1 short encouraging sentence in English\n\n"
            f"CEFR level: {req.cefr}\n"
            f"Exercise type: {req.q_type}\n"
            f"Prompt shown to student: {req.prompt}\n"
            f"Student's answer: {req.user_answer}\n"
            f"Expected answer: {req.expected_answer}\n"
            f"Grammar note: {req.note}\n"
        )
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1, max_tokens=220,
        )
        txt = resp.choices[0].message.content.strip()
        txt = _re.sub(r'^```(?:json)?\s*', '', txt)
        txt = _re.sub(r'\s*```$', '', txt)
        data = json.loads(txt)
        return {
            "corrected":   str(data.get("corrected",   req.expected_answer)).strip() or req.expected_answer,
            "explanation": str(data.get("explanation", "")).strip(),
            "next_step":   str(data.get("next_step",   "")).strip(),
        }
    except Exception as exc:
        logging.warning(f"ai/mistake-feedback Groq error: {exc}")
        return {
            "corrected":   req.expected_answer,
            "explanation": "Check the verb conjugation and noun agreements carefully — those are the most common sources of errors here.",
            "next_step":   "You're making progress — try the next one!",
        }


@app.get("/api/ai/coach-plan")
def ai_coach_plan():
    """
    AI-generated daily plan blending adaptive profile + CEFR mission status.
    """
    try:
        profile = _adaptive_profile()
        missions = cefr_missions()
        next_mission = next((m for m in missions.get("missions", []) if m.get("unlocked") and not m.get("completed")), None)
        prompt = (
            "Return strict JSON with keys: headline, blocks, focus. "
            "blocks must be an array of 3 concise study blocks.\n\n"
            f"Adaptive profile: {json.dumps(profile)}\n"
            f"Next mission: {json.dumps(next_mission or {})}\n"
        )
        data = _ai_json_or_none(prompt)
        if data and isinstance(data, dict):
            blocks = data.get("blocks") if isinstance(data.get("blocks"), list) else []
            return {
                "headline": str(data.get("headline", "Your adaptive French plan for today")).strip(),
                "focus": str(data.get("focus", profile.get("recommendation", "Build consistency with daily mixed practice."))).strip(),
                "blocks": [str(b).strip() for b in blocks[:3]] or [
                    "Warm-up: 8 mixed Learn drills",
                    "Remediation: 10 minutes on weak prompts",
                    "Checkpoint prep: 1 timed mini-run",
                ],
            }
        return {
            "headline": "Your adaptive French plan for today",
            "focus": profile.get("recommendation", "Build consistency with daily mixed practice."),
            "blocks": [
                "Warm-up: 8 mixed Learn drills",
                "Remediation: 10 minutes on weak prompts",
                "Checkpoint prep: 1 timed mini-run",
            ],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/adaptive/event")
def adaptive_event(req: AdaptiveEventRequest):
    try:
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            db.execute(
                """
                INSERT INTO adaptive_events
                (q_type, cefr, skill_tag, prompt, correct, response_ms, user_answer, expected_answer)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    req.q_type,
                    (req.cefr or "A1").upper(),
                    req.skill_tag or _skill_tag_for(req.q_type, req.prompt),
                    req.prompt,
                    1 if req.correct else 0,
                    max(int(req.response_ms or 0), 0),
                    req.user_answer,
                    req.expected_answer,
                ),
            )
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/adaptive/profile")
def adaptive_profile():
    try:
        return _adaptive_profile()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/adaptive/weak-skill-report")
def weak_skill_report():
    try:
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            rows = db.execute(
                """
                SELECT skill_tag, COUNT(*) as attempts, SUM(CASE WHEN correct=0 THEN 1 ELSE 0 END) as wrong
                FROM adaptive_events
                GROUP BY skill_tag
                HAVING attempts >= 2
                ORDER BY CAST(wrong as FLOAT)/attempts DESC, attempts DESC
                LIMIT 6
                """
            ).fetchall()
        return {
            "skills": [
                {"skill_tag": r[0], "attempts": int(r[1] or 0), "error_rate": round((int(r[2] or 0) / max(int(r[1] or 1), 1)), 3)}
                for r in rows
            ]
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/adaptive/review-queue")
def adaptive_review_queue(limit: int = 10):
    try:
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            rows = db.execute(
                """
                SELECT prompt, q_type, skill_tag, MAX(created_at) as seen_at,
                       COUNT(*) as attempts,
                       SUM(CASE WHEN correct=0 THEN 1 ELSE 0 END) as wrong,
                       (julianday('now') - julianday(MAX(created_at))) as age_days
                FROM adaptive_events
                GROUP BY prompt, q_type, skill_tag
                HAVING wrong > 0
                ORDER BY (CAST(wrong as FLOAT)/attempts) * (1 + MIN(3.0, MAX(0.0, (julianday('now') - julianday(MAX(created_at)))) / 3.0)) DESC, seen_at ASC
                LIMIT ?
                """,
                (max(1, min(limit, 50)),),
            ).fetchall()
        return {
            "items": [
                {"prompt": r[0], "q_type": r[1], "skill_tag": r[2], "attempts": int(r[4] or 0), "error_rate": round((int(r[5] or 0)/max(int(r[4] or 1), 1)), 3), "age_days": round(float(r[6] or 0.0), 2)}
                for r in rows
            ]
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/adaptive/next-best-lesson")
def adaptive_next_best_lesson():
    try:
        import sqlite3
        _ensure_core_db()
        profile = _adaptive_profile()
        queue = adaptive_review_queue(limit=5).get("items", [])
        weak = weak_skill_report().get("skills", [])
        with sqlite3.connect("cato_mind.db") as db:
            row = db.execute("SELECT elo FROM learner WHERE id=1").fetchone()
        elo = int(row[0]) if row else 800
        if elo < 1000:
            cefr = "A1"
        elif elo < 1200:
            cefr = "A2"
        elif elo < 1400:
            cefr = "B1"
        elif elo < 1600:
            cefr = "B2"
        elif elo < 1800:
            cefr = "C1"
        else:
            cefr = "C2"
        top_item = queue[0] if queue else None
        top_skill = weak[0]["skill_tag"] if weak else "general"
        return {
            "cefr": cefr,
            "focus_skill": top_skill,
            "recommended_prompt": (top_item or {}).get("prompt", ""),
            "recommended_q_type": (top_item or {}).get("q_type", "mixed"),
            "reason": profile.get("recommendation", "Continue with mixed lessons and targeted review."),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/learn/progress")
def learn_progress(req: LearnProgressRequest):
    try:
        import sqlite3
        from datetime import date
        _ensure_core_db()
        xp_gain = 12 if req.correct else 4
        elo_gain = 10 if req.correct else -4
        today = date.today().isoformat()
        with sqlite3.connect("cato_mind.db") as db:
            # Update learner XP + ELO
            row = db.execute("SELECT xp, elo FROM learner WHERE id=1").fetchone()
            xp = (row[0] if row else 0) + xp_gain
            elo = max(700, min(2200, (row[1] if row else 800) + elo_gain))
            db.execute("UPDATE learner SET xp=?, elo=? WHERE id=1", (xp, elo))

            # Update daily XP and streak
            ss = db.execute(
                "SELECT daily_goal_xp, current_streak, longest_streak, last_active_date, xp_today, xp_today_date FROM streak_state WHERE id=1"
            ).fetchone()
            if ss:
                goal_xp, cur_streak, long_streak, last_active, xp_today, xp_today_date = ss
                # Reset daily XP if it's a new day
                if xp_today_date != today:
                    xp_today = 0
                xp_today += xp_gain
                # Update streak: count today as active if this is first activity of day
                if last_active != today:
                    from datetime import date as d, timedelta
                    yesterday = (d.today() - timedelta(days=1)).isoformat()
                    if last_active == yesterday:
                        cur_streak += 1  # continued streak
                    else:
                        cur_streak = 1   # reset or brand new
                    long_streak = max(long_streak, cur_streak)
                    last_active = today
                db.execute(
                    """UPDATE streak_state SET xp_today=?, xp_today_date=?,
                       current_streak=?, longest_streak=?, last_active_date=? WHERE id=1""",
                    (xp_today, today, cur_streak, long_streak, last_active)
                )
        return {"ok": True, "xp_gain": xp_gain, "elo_gain": elo_gain}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/c1/status")
def c1_status():
    try:
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            row = db.execute("SELECT elo FROM learner WHERE id=1").fetchone()
        elo = int(row[0]) if row else 800
        profile = _adaptive_profile()
        target = 1600
        pct = max(0, min(100, int((elo / target) * 100)))
        mastery = float(profile.get("mastery_score", 0.0))
        streak = int(profile.get("streak", 0))
        readiness = elo >= 1550 and mastery >= 75 and streak >= 5
        recommendation = profile.get("recommendation", "Keep practicing daily.")
        return {
            "elo": elo,
            "target_elo": target,
            "pct_to_c1": pct,
            "mastery_score": mastery,
            "streak": streak,
            "readiness": readiness,
            "recommendation": recommendation,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/c2/status")
def c2_status():
    try:
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            row = db.execute("SELECT elo FROM learner WHERE id=1").fetchone()
        elo = int(row[0]) if row else 800
        profile = _adaptive_profile()
        target = 1800
        pct = max(0, min(100, int((elo / target) * 100)))
        mastery = float(profile.get("mastery_score", 0.0))
        streak = int(profile.get("streak", 0))
        readiness = elo >= 1750 and mastery >= 80 and streak >= 7
        recommendation = profile.get("recommendation", "Keep practicing daily.")
        return {
            "elo": elo,
            "target_elo": target,
            "pct_to_c2": pct,
            "mastery_score": mastery,
            "streak": streak,
            "readiness": readiness,
            "recommendation": recommendation,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/cefr/missions")
def cefr_missions():
    try:
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            row = db.execute("SELECT elo FROM learner WHERE id=1").fetchone()
        elo = int(row[0]) if row else 800
        checkpoints = _load_checkpoints()
        levels = [("A1", 0), ("A2", 1000), ("B1", 1200), ("B2", 1400), ("C1", 1600), ("C2", 1800)]
        missions = []
        prev_completed = True
        for level, min_elo in levels:
            completed = bool(checkpoints.get(level, False))
            unlocked = prev_completed and elo >= min_elo
            missions.append({
                "level": level,
                "min_elo": min_elo,
                "unlocked": unlocked,
                "completed": completed,
                "required_pct": _checkpoint_required_pct(level),
            })
            prev_completed = prev_completed and completed
        return {"missions": missions, "elo": elo}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/cefr/checkpoint/{level}")
def run_cefr_checkpoint(level: str, req: Optional[CheckpointSubmitRequest] = None):
    try:
        level = level.upper()
        if level not in {"A1", "A2", "B1", "B2", "C1", "C2"}:
            raise HTTPException(status_code=400, detail="Invalid CEFR level")
        if req and req.score_pct is not None:
            score_pct = max(0, min(100, int(req.score_pct)))
            sample = 10
            profile = _adaptive_profile()
        else:
            acc, sample = _recent_accuracy(40)
            profile = _adaptive_profile()
            mastery = float(profile.get("mastery_score", 0.0)) / 100.0
            # Blended score: recent correctness + long-term mastery
            score_pct = int(round((acc * 0.7 + mastery * 0.3) * 100))
        required = _checkpoint_required_pct(level)
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            fail_row = db.execute(
                "SELECT value FROM app_settings WHERE key=?",
                (f"checkpoint_fail_{level.lower()}",),
            ).fetchone()
            cooldown_row = db.execute(
                "SELECT value FROM app_settings WHERE key=?",
                (f"checkpoint_cooldown_{level.lower()}",),
            ).fetchone()
        fail_count = int((fail_row[0] if fail_row else "0") or "0")
        cooldown_until = int((cooldown_row[0] if cooldown_row else "0") or "0")
        now_ts = int(time.time())
        if cooldown_until > now_ts:
            return {
                "level": level,
                "passed": False,
                "score_pct": score_pct,
                "required_pct": required,
                "recommendation": f"Cooldown active. Review weak prompts, then retry in about {max(1, (cooldown_until - now_ts) // 60)} min.",
            }
        remediation_gate = fail_count >= 2 and float(profile.get("mastery_score", 0)) < (required - 5)
        passed = (sample >= 8 and score_pct >= required) and not remediation_gate
        recommendation = (
            "Checkpoint passed. Advance to the next CEFR mission."
            if passed else
            f"Checkpoint not passed yet. Do targeted review, then retry {level}."
        )
        with sqlite3.connect("cato_mind.db") as db:
            db.execute(
                "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
                (f"checkpoint_{level.lower()}", "passed" if passed else "failed"),
            )
            if passed:
                db.execute("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", (f"checkpoint_fail_{level.lower()}", "0"))
                db.execute("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", (f"checkpoint_cooldown_{level.lower()}", "0"))
            else:
                next_fail = fail_count + 1
                db.execute("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", (f"checkpoint_fail_{level.lower()}", str(next_fail)))
                if next_fail >= 2:
                    db.execute(
                        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
                        (f"checkpoint_cooldown_{level.lower()}", str(now_ts + 20 * 60)),
                    )
        return {
            "level": level,
            "passed": passed,
            "score_pct": score_pct,
            "required_pct": required,
            "recommendation": recommendation,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/unit/checkpoint/{unit_id}")
def run_unit_checkpoint(unit_id: str, req: Optional[CheckpointSubmitRequest] = None):
    try:
        score = max(0, min(100, int(req.score_pct if req and req.score_pct is not None else 0)))
        required = 70
        passed = score >= required
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            db.execute(
                "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
                (f"unit_checkpoint_{unit_id}", "passed" if passed else "failed"),
            )
        return {
            "unit_id": unit_id,
            "passed": passed,
            "score_pct": score,
            "required_pct": required,
            "recommendation": "Unit cleared. Continue to next unit." if passed else "Review this unit and retry checkpoint.",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Stories ───────────────────────────────────────────────────────────────────

@app.get("/api/stories")
def get_stories():
    try:
        from stories import STORIES, get_story_progress, get_unlocked_stories
        from curriculum import load_thread
        thread   = load_thread()
        unlocked = {s.id for s in get_unlocked_stories(thread.cefr_level)}
        progress = get_story_progress()
        return {"stories": [
            {"id":       s.id, "title_fr": s.title_fr, "title_en": s.title_en,
             "setting":  s.setting, "cefr":     s.cefr, "emoji":    s.emoji,
             "unlocked": s.id in unlocked,
             "progress": progress.get(s.id, {}),
             "vocab_focus":   s.vocab_focus,
             "culture_note":  s.culture_note}
            for s in STORIES
        ]}
    except Exception:
        from bundled_stories import bundled_stories_api_payload
        return {"stories": bundled_stories_api_payload(_get_learner_elo())}


@app.get("/api/stories/{story_id}")
def get_story(story_id: str):
    try:
        from stories import STORY_MAP
        s = STORY_MAP.get(story_id)
        if not s:
            raise HTTPException(status_code=404, detail="Story not found")
        return {
            "id": s.id, "title_fr": s.title_fr, "title_en": s.title_en,
            "setting": s.setting, "cefr": s.cefr, "emoji": s.emoji,
            "culture_note": s.culture_note, "vocab_focus": s.vocab_focus,
            "lines": [{"speaker": l.speaker, "french": l.french,
                       "english": l.english, "audio_hint": l.audio_hint,
                       "glosses": l.glosses} for l in s.lines],
            "questions": [{"question_fr": q.question_fr, "question_en": q.question_en,
                           "options": q.options, "correct": q.correct,
                           "explanation": q.explanation} for q in s.questions],
        }
    except HTTPException:
        raise
    except Exception:
        from bundled_stories import BUNDLED_STORY_MAP, story_to_detail_dict, story_unlocked_for_elo
        s = BUNDLED_STORY_MAP.get(story_id)
        if not s:
            raise HTTPException(status_code=404, detail="Story not found")
        if not story_unlocked_for_elo(s.cefr, _get_learner_elo()):
            raise HTTPException(status_code=403, detail="Story locked for your level")
        return story_to_detail_dict(s)


@app.post("/api/stories/{story_id}/complete")
def complete_story(story_id: str, score: int, total: int):
    try:
        from stories import save_story_result as _save_story
    except ImportError:
        from bundled_stories import BUNDLED_STORY_MAP, bundled_save_story_result
        if story_id not in BUNDLED_STORY_MAP:
            raise HTTPException(status_code=404, detail="Story not found")
        _ensure_core_db()
        bundled_save_story_result(story_id, score, total)
        return {"ok": True}
    try:
        _save_story(story_id, score, total)
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Onboarding ────────────────────────────────────────────────────────────────

@app.get("/api/onboarding/placement-quiz")
def get_placement_quiz_endpoint():
    try:
        from placement_quiz import get_placement_quiz
        return get_placement_quiz()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/onboarding/status")
def onboarding_status():
    try:
        from onboarding import is_onboarded
        return {"onboarded": is_onboarded()}
    except Exception:
        try:
            _ensure_core_db()
            import sqlite3
            with sqlite3.connect("cato_mind.db") as db:
                row = db.execute(
                    "SELECT value FROM app_settings WHERE key='onboarded' LIMIT 1"
                ).fetchone()
            return {"onboarded": bool(row and row[0] == "1")}
        except Exception:
            return {"onboarded": False}


@app.post("/api/onboarding/complete")
def complete_onboarding(req: OnboardingRequest):
    try:
        _ensure_core_db()
        import sqlite3

        with sqlite3.connect("cato_mind.db") as db:
            elo = 800 + (req.placement_score * 80)
            db.execute("UPDATE learner SET name=?, elo=? WHERE id=1",
                       (req.name, min(elo, 1200)))
            db.execute(
                "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
                ("user_name", req.name),
            )
            db.execute(
                "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
                ("user_goal", req.goal),
            )
            db.execute(
                "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
                ("daily_goal_xp", str(req.daily_xp)),
            )
            db.execute(
                "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
                ("onboarded", "1"),
            )
            db.execute("UPDATE streak_state SET daily_goal_xp=? WHERE id=1", (req.daily_xp,))
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Memory log ────────────────────────────────────────────────────────────────

@app.get("/api/memory/log")
def memory_log(limit: int = 50):
    try:
        _ensure_core_db()
        import sqlite3
        with sqlite3.connect("cato_mind.db") as db:
            rows = db.execute(
                """SELECT id, unit_id, cefr, accuracy_pct, xp_earned, finished_at
                   FROM lesson_log ORDER BY finished_at DESC LIMIT ?""",
                (limit,)
            ).fetchall()
        items = [
            {
                "id": r[0],
                "lesson_id": r[1] or "lesson",
                "source": "lesson",
                "title": f"{r[2]} Lesson — {r[1] or 'General'}",
                "detail": f"{r[3]}% accuracy · {r[4]} XP",
                "created_at": r[5] or "",
            }
            for r in rows
        ]
        return {"items": items}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Settings ──────────────────────────────────────────────────────────────────

@app.get("/api/settings")
def get_settings():
    try:
        _ensure_core_db()
        import sqlite3
        with sqlite3.connect("cato_mind.db") as db:
            rows = db.execute("SELECT key, value FROM app_settings").fetchall()
        return {"settings": {r[0]: r[1] for r in rows}}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/settings")
def save_settings(req: SettingRequest):
    try:
        _ensure_core_db()
        import sqlite3
        with sqlite3.connect("cato_mind.db") as db:
            db.execute(
                "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
                (req.key, req.value),
            )
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── Word lookup ───────────────────────────────────────────────────────────────

def _ai_translate_word(word: str) -> dict:
    """
    Call Groq (llama-3.3-70b) to translate a word bidirectionally.
    Auto-detects whether the input is French or English and translates accordingly.
    Returns: french, english, direction ('fr-en' or 'en-fr'), part_of_speech, note, is_cognate.
    """
    import json, re
    key = _groq_key()
    if not key:
        return {"french": word, "english": "—", "direction": "fr-en", "part_of_speech": None, "note": None, "is_cognate": False}
    try:
        from groq import Groq
        client = Groq(api_key=key)
        prompt = (
            f'You are a bilingual French/English dictionary expert.\n'
            f'The word to look up is: "{word}"\n'
            'Detect whether this word is French or English, then provide the translation in the other language.\n'
            'Respond with ONLY valid JSON (no markdown, no code fences):\n'
            '{{"french": "<the French word>", "english": "<the English meaning>", '
            '"direction": "<fr-en or en-fr>", '
            '"part_of_speech": "<noun|verb|adjective|adverb|preposition|article|pronoun|conjunction|other>", '
            '"note": "<one short grammar/usage note max 12 words, or null>", "is_cognate": <true|false>}}\n'
            'direction must be "fr-en" if the input word was French, "en-fr" if it was English.\n'
            'is_cognate means the French and English words look/sound similar and share a meaning.'
        )
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=140,
        )
        text = resp.choices[0].message.content.strip()
        text = re.sub(r'^```(?:json)?\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
        data = json.loads(text)
        return {
            "french":         data.get("french", word),
            "english":        data.get("english", "—"),
            "direction":      data.get("direction", "fr-en"),
            "part_of_speech": data.get("part_of_speech"),
            "note":           data.get("note"),
            "is_cognate":     bool(data.get("is_cognate", False)),
        }
    except Exception as exc:
        logging.warning(f"Groq word lookup failed for '{word}': {exc}")
        return {"french": word, "english": "—", "direction": "fr-en", "part_of_speech": None, "note": None, "is_cognate": False}


@app.get("/api/word/{word}")
def lookup_word(word: str):
    """
    Hover-to-translate: bidirectional French↔English lookup.
    Checks vocabulary DB for both French and English columns, then falls back to Groq AI.
    """
    import sqlite3
    word_lower = word.lower().strip(".,!?;:'\"«»—-")
    if not word_lower or len(word_lower) < 2:
        return {"french": word, "english": "—", "direction": "fr-en", "found": False}

    # Try local DB — check both French and English columns
    row = None
    direction = "fr-en"
    try:
        with sqlite3.connect("cato_mind.db") as db:
            # French → English lookup
            row = db.execute(
                "SELECT french, english, latin_root, is_cognate FROM vocabulary WHERE LOWER(french)=? LIMIT 1",
                (word_lower,)
            ).fetchone()
            if not row:
                # English → French lookup
                row = db.execute(
                    "SELECT french, english, latin_root, is_cognate FROM vocabulary WHERE LOWER(english)=? LIMIT 1",
                    (word_lower,)
                ).fetchone()
                if row:
                    direction = "en-fr"
    except Exception:
        pass

    if row:
        return {
            "french":         row[0],
            "english":        row[1],
            "part_of_speech": None,
            "note":           row[2],
            "is_cognate":     bool(row[3]),
            "direction":      direction,
            "found":          True,
        }

    # Not in DB — use Groq AI (auto-detects language and translates bidirectionally)
    ai = _ai_translate_word(word_lower)
    return {
        "french":         ai["french"],
        "english":        ai["english"],
        "part_of_speech": ai["part_of_speech"],
        "note":           ai["note"],
        "is_cognate":     ai["is_cognate"],
        "direction":      ai["direction"],
        "found":          ai["english"] != "—",
    }


# ── Morning brief ─────────────────────────────────────────────────────────────

@app.post("/api/brief/generate")
async def generate_brief(background_tasks: BackgroundTasks):
    def _run():
        try:
            from morning_brief import run_morning_brief
            run_morning_brief()
        except Exception as exc:
            log.error("Brief generation failed: %s", exc)
    background_tasks.add_task(_run)
    return {"ok": True, "message": "Brief generating in background"}


# ── Progress ──────────────────────────────────────────────────────────────────

@app.post("/api/lesson/complete")
def lesson_complete(req: dict = Body(default={})):
    """Record a completed lesson round (called by frontend when unit advances)."""
    try:
        import sqlite3
        _ensure_core_db()
        unit_id  = str(req.get("unit_id", "general"))
        cefr     = str(req.get("cefr", "A1")).upper()
        answered = int(req.get("questions_answered", 0))
        accuracy = int(req.get("accuracy_pct", 0))
        xp_earned = int(req.get("xp_earned", 0))
        with sqlite3.connect("cato_mind.db") as db:
            db.execute(
                """INSERT INTO lesson_log (unit_id, cefr, questions_answered, accuracy_pct, xp_earned)
                   VALUES (?, ?, ?, ?, ?)""",
                (unit_id, cefr, answered, accuracy, xp_earned)
            )
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/memory")
def get_memory():
    """
    Returns a 'welcome back' memory card summarising the learner's progress:
    streak, XP today, last lesson, total lessons, weak skill, and a greeting.
    """
    try:
        import sqlite3
        from datetime import date, datetime
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            learner_row = db.execute(
                "SELECT name, elo, xp FROM learner WHERE id=1"
            ).fetchone()
            ss = db.execute(
                "SELECT daily_goal_xp, current_streak, longest_streak, xp_today, last_active_date FROM streak_state WHERE id=1"
            ).fetchone()
            last_lesson = db.execute(
                "SELECT unit_id, cefr, accuracy_pct, xp_earned, finished_at FROM lesson_log ORDER BY id DESC LIMIT 1"
            ).fetchone()
            total_lessons = db.execute("SELECT COUNT(*) FROM lesson_log").fetchone()[0]
            total_answers = db.execute("SELECT COUNT(*) FROM adaptive_events").fetchone()[0]
            weak_skill = db.execute(
                """SELECT skill_tag, CAST(SUM(CASE WHEN correct=0 THEN 1 ELSE 0 END) AS FLOAT)/COUNT(*) as err
                   FROM adaptive_events GROUP BY skill_tag HAVING COUNT(*) >= 3
                   ORDER BY err DESC LIMIT 1"""
            ).fetchone()

        name       = learner_row[0] if learner_row else "Learner"
        elo        = learner_row[1] if learner_row else 800
        total_xp   = learner_row[2] if learner_row else 0
        goal_xp    = ss[0] if ss else 50
        streak     = ss[1] if ss else 0
        longest    = ss[2] if ss else 0
        xp_today   = ss[3] if ss else 0
        last_active = ss[4] if ss else None

        # Build greeting
        today = date.today().isoformat()
        if last_active == today:
            greeting = f"Welcome back, {name}! Keep your {streak}-day streak going 🔥"
        elif streak == 0 and total_answers == 0:
            greeting = f"Bonjour, {name}! Ready to start your French journey?"
        elif streak > 0:
            greeting = f"Bienvenue, {name}! Your {streak}-day streak is waiting 💪"
        else:
            greeting = f"Welcome back, {name}! Let's get back on track."

        result = {
            "greeting":       greeting,
            "name":           name,
            "streak":         streak,
            "longest_streak": longest,
            "xp_today":       xp_today,
            "daily_goal_xp":  goal_xp,
            "goal_pct":       min(100, int((xp_today / max(goal_xp, 1)) * 100)),
            "total_xp":       total_xp,
            "elo":            elo,
            "total_lessons":  int(total_lessons or 0),
            "total_answers":  int(total_answers or 0),
        }
        if last_lesson:
            result["last_lesson"] = {
                "unit_id":    last_lesson[0],
                "cefr":       last_lesson[1],
                "accuracy":   last_lesson[2],
                "xp_earned":  last_lesson[3],
                "finished_at": last_lesson[4],
            }
        if weak_skill:
            result["top_weak_skill"] = {
                "skill": weak_skill[0],
                "error_rate": round(float(weak_skill[1]), 2),
            }
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/units/completed")
def get_completed_units():
    """Return the set of unit/grammar IDs the learner has completed."""
    try:
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            rows = db.execute(
                "SELECT unit_id, kind FROM completed_units"
            ).fetchall()
        units   = [r[0] for r in rows if r[1] == 'unit']
        grammar = [r[0] for r in rows if r[1] == 'grammar']
        return {"units": units, "grammar": grammar}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/units/{unit_id}/complete")
def mark_unit_completed(unit_id: str, req: dict = Body(default={})):
    """Persist a completed unit (or grammar node)."""
    try:
        import sqlite3
        _ensure_core_db()
        kind = str(req.get("kind", "unit"))
        if kind not in ("unit", "grammar"):
            kind = "unit"
        with sqlite3.connect("cato_mind.db") as db:
            db.execute(
                "INSERT OR IGNORE INTO completed_units (unit_id, kind) VALUES (?, ?)",
                (unit_id, kind),
            )
        return {"ok": True, "unit_id": unit_id, "kind": kind}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.delete("/api/units/{unit_id}/complete")
def reset_unit_completion(unit_id: str):
    try:
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            db.execute("DELETE FROM completed_units WHERE unit_id = ?", (unit_id,))
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/progress")
def get_progress():
    try:
        from elo_engine import get_elo_history
        import sqlite3
        with sqlite3.connect("cato_mind.db") as db:
            sessions = db.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
            vocab_mastered = db.execute(
                "SELECT COUNT(*) FROM vocabulary WHERE sm2_reps >= 3"
            ).fetchone()[0]
            stories_done = db.execute(
                "SELECT COUNT(*) FROM story_progress WHERE completed=1"
            ).fetchone()[0] if _table_exists("story_progress") else 0
        history = get_elo_history(30)
        return {
            "sessions":       sessions,
            "vocab_mastered": vocab_mastered,
            "stories_done":   stories_done,
            "elo_history":    history,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


def _table_exists(name: str) -> bool:
    import sqlite3
    with sqlite3.connect("cato_mind.db") as db:
        row = db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,)
        ).fetchone()
    return row is not None


# ── Run directly ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
