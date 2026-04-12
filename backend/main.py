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

from fastapi import FastAPI, HTTPException, BackgroundTasks
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

class LessonMemoryIn(BaseModel):
    lesson_id: str
    title: str
    source: str = "course"
    unit_id: Optional[str] = None
    detail: Optional[str] = None


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

def _gemini_key() -> str:
    return os.getenv("CATO_GEMINI_KEY", "")

def _safe(func, *args, fallback=None, **kwargs):
    try:
        return func(*args, **kwargs)
    except Exception as exc:
        log.error("API error in %s: %s", func.__name__, exc)
        return fallback


def _ensure_core_db() -> None:
    """
    This Mac bundle can be distributed without init scripts/modules.
    Ensure the minimum schema exists so onboarding can complete.
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
                daily_goal_xp INTEGER NOT NULL DEFAULT 50
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
        db.execute(
            "INSERT OR IGNORE INTO learner (id, name, elo, xp, unit_level) VALUES (1, 'Learner', 800, 0, 1)"
        )
        db.execute(
            "INSERT OR IGNORE INTO streak_state (id, daily_goal_xp) VALUES (1, 50)"
        )
        cols = {r[1] for r in db.execute("PRAGMA table_info(adaptive_events)").fetchall()}
        if "cefr" not in cols:
            db.execute("ALTER TABLE adaptive_events ADD COLUMN cefr TEXT NOT NULL DEFAULT 'A1'")
        if "skill_tag" not in cols:
            db.execute("ALTER TABLE adaptive_events ADD COLUMN skill_tag TEXT NOT NULL DEFAULT 'general'")
        db.execute("""
            CREATE TABLE IF NOT EXISTS lesson_completion_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                lesson_id TEXT NOT NULL,
                unit_id TEXT,
                title TEXT NOT NULL,
                source TEXT NOT NULL DEFAULT 'course',
                detail TEXT
            )
        """)
        db.execute("""
            CREATE TABLE IF NOT EXISTS hover_translation_cache (
                fr_norm TEXT PRIMARY KEY,
                en_text TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        """)


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


# Appended to Voltaire / lesson tutor system prompts so the model never defaults to English.
VOLTAIRE_FRENCH_ONLY_SYSTEM = (
    "\n\n[Règle absolue — langue] Tu es Voltaire, tuteur de français. "
    "Toutes tes réponses doivent être ENTIÈREMENT en français (aucune phrase en anglais ni autre langue). "
    "Si l'élève écrit dans une autre langue, réponds quand même en français et invite-le poliment à continuer en français. "
    "Corrections, explications et encouragements : uniquement en français."
)


def _fallback_tutor_reply(user_text: str, persona: str = "voltaire") -> str:
    text = (user_text or "").strip()
    if persona == "mathieu":
        return (
            "D'accord, on continue en francais. "
            "Dis-moi une phrase sur ta journee, et je te corrige doucement si besoin."
        )
    if not text:
        return "Bienvenue. Ecrivons en francais. Dis-moi comment s'est passee ta journee."
    return (
        "Bonne tentative. Version plus naturelle: "
        f"\"{text}\". "
        "Maintenant, reponds avec une phrase un peu plus longue en francais."
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


# ── Lesson memory log (completed milestones) ──────────────────────────────────

@app.post("/api/lesson-memory")
def post_lesson_memory(body: LessonMemoryIn):
    _ensure_core_db()
    import sqlite3
    try:
        with sqlite3.connect("cato_mind.db") as db:
            db.execute(
                """INSERT INTO lesson_completion_log (lesson_id, unit_id, title, source, detail)
                   VALUES (?,?,?,?,?)""",
                (
                    body.lesson_id[:200],
                    (body.unit_id or "")[:120] or None,
                    body.title[:500],
                    body.source[:80],
                    (body.detail or "")[:2000] or None,
                ),
            )
        return {"ok": True}
    except Exception as exc:
        log.warning("lesson-memory log: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/lesson-memory")
def get_lesson_memory(limit: int = 100):
    _ensure_core_db()
    import sqlite3
    lim = max(1, min(limit, 200))
    with sqlite3.connect("cato_mind.db") as db:
        rows = db.execute(
            """SELECT id, created_at, lesson_id, unit_id, title, source, detail
               FROM lesson_completion_log ORDER BY id DESC LIMIT ?""",
            (lim,),
        ).fetchall()
    items = [
        {
            "id": r[0],
            "created_at": r[1],
            "lesson_id": r[2],
            "unit_id": r[3] or "",
            "title": r[4],
            "source": r[5],
            "detail": r[6] or "",
        }
        for r in rows
    ]
    return {"items": items}


# ── Hover translation (French → English, cached) ─────────────────────────────

def _hover_lookup_cached(word: str, langpair: str) -> str:
    import sqlite3
    import urllib.parse
    import urllib.request

    w = word.strip().lower()
    if not w or len(w) > 80:
        return ""
    cache_key = f"{langpair}:{w}"
    _ensure_core_db()
    with sqlite3.connect("cato_mind.db") as db:
        row = db.execute(
            "SELECT en_text FROM hover_translation_cache WHERE fr_norm = ?", (cache_key,)
        ).fetchone()
        if row and row[0]:
            return row[0]
    try:
        q = urllib.parse.urlencode({"q": w, "langpair": langpair})
        url = f"https://api.mymemory.translated.net/get?{q}"
        with urllib.request.urlopen(url, timeout=5) as resp:
            data = json.loads(resp.read().decode())
        out = (data.get("responseData") or {}).get("translatedText") or ""
        if not out or "MYMEMORY WARNING" in out.upper():
            return ""
        with sqlite3.connect("cato_mind.db") as db:
            db.execute(
                "INSERT OR REPLACE INTO hover_translation_cache (fr_norm, en_text) VALUES (?,?)",
                (cache_key, out[:500]),
            )
        return out
    except Exception as exc:
        log.warning("hover translate %s: %s", w, exc)
        return ""


@app.get("/api/translate/hover")
def translate_hover(q: str = "", pair: str = "fr|en"):
    if not q or not q.strip():
        return {"text": ""}
    lp = pair if "|" in pair else "fr|en"
    if lp not in ("fr|en", "en|fr"):
        lp = "fr|en"
    gloss = _hover_lookup_cached(q, lp)
    return {"text": gloss or "—"}


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
        state   = get_streak_state()
        weekly  = get_weekly_summary()
        return {**state, "weekly": weekly}
    except Exception as exc:
        log.warning("Streak error: %s", exc)
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
    """Start a lesson — returns first Voltaire message. Non-streaming."""
    try:
        from curriculum import (load_thread, save_thread, build_voltaire_system_prompt,
                                 build_opening_prompt, check_level_promotion)
        from spaced_repetition import get_due_words
        from gpu_router import route_and_call
        from lesson_engine import annotate_text
        from elo_engine import open_session

        thread    = load_thread()
        due_words = get_due_words(limit=5)
        promotion = check_level_promotion(800, thread)
        if promotion:
            thread.level_up(promotion)

        sys_p  = build_voltaire_system_prompt(800, thread) + VOLTAIRE_FRENCH_ONLY_SYSTEM
        usr_p  = build_opening_prompt(thread, due_words)
        result = route_and_call(usr_p, system=sys_p, gemini_api_key=_gemini_key())
        annotated = annotate_text(result["text"])

        session_id = open_session(mode="study")
        thread.record_lesson()
        save_thread(thread)

        return {
            "text":       result["text"],
            "annotated":  annotated,
            "backend":    result.get("backend", "unknown"),
            "session_id": session_id,
        }
    except Exception:
        text = _fallback_tutor_reply("")
        return {
            "text": text,
            "annotated": text,
            "backend": "fallback",
            "session_id": "local-fallback",
        }


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
    Streaming version using route_and_call (same as lesson/start — proven to work).
    Builds history into the prompt so Voltaire remembers the conversation.
    Streams word-by-word for the typing effect.
    """
    async def generate():
        try:
            from curriculum import load_thread, build_voltaire_system_prompt
            from gpu_router import route_and_call

            thread = load_thread()
            sys_p  = build_voltaire_system_prompt(800, thread) + VOLTAIRE_FRENCH_ONLY_SYSTEM
            key    = _gemini_key()

            # Build conversation history into the prompt as plain text
            history_lines = []
            for msg in req.history[-14:]:  # last 14 messages
                role = "Voltaire" if msg.get("role") == "assistant" else "Jackson"
                text = str(msg.get("text") or msg.get("content") or "").strip()
                if text:
                    history_lines.append(f"{role}: {text}")

            if history_lines:
                history_block = "\n\n".join(history_lines)
                prompt = (
                    f"[Suite de la leçon — ne te présente pas à nouveau. "
                    f"Réponds directement au dernier message de l'élève. "
                    f"Réponse UNIQUEMENT en français.]\n\n"
                    f"Conversation :\n{history_block}\n\n"
                    f"Élève : {req.user_input}\n\n"
                    f"Voltaire (poursuis en français) :"
                )
            else:
                prompt = (
                    f"Élève : {req.user_input}\n\n"
                    f"Voltaire (réponds uniquement en français) :"
                )

            # Run in thread pool so we don't block the event loop
            import concurrent.futures
            loop = asyncio.get_event_loop()
            with concurrent.futures.ThreadPoolExecutor() as pool:
                result = await loop.run_in_executor(
                    pool,
                    lambda: route_and_call(prompt, system=sys_p, gemini_api_key=key)
                )

            text_out = result.get("text") if result else None

            if not text_out or not isinstance(text_out, str):
                yield f"data: {json.dumps({'error': 'Empty response from AI backend'})}\n\n"
                yield "data: [DONE]\n\n"
                return

            # Stream word by word
            words = text_out.split(" ")
            for i, word in enumerate(words):
                token = word if i == len(words) - 1 else word + " "
                yield f"data: {json.dumps({'token': token})}\n\n"
                await asyncio.sleep(0.012)

            yield "data: [DONE]\n\n"

        except Exception:
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
    Give fast correction/explanation for sentence-order errors.
    Uses AI when available, with a deterministic fallback.
    """
    try:
        corrected = req.correct_answer.strip()
        user = req.user_answer.strip()
        if not corrected:
            return {"corrected": corrected, "explanation": "Use subject + verb + complements in French word order."}

        prompt = (
            "You are a concise French tutor. The learner made a sentence-order mistake.\n"
            "Return strict JSON only with keys: corrected, explanation.\n"
            "Rules:\n"
            "- explanation max 2 short sentences\n"
            "- focus on word order or grammar placement\n"
            "- keep beginner-friendly language\n\n"
            f"Exercise prompt: {req.prompt}\n"
            f"Learner answer: {user}\n"
            f"Correct answer: {corrected}\n"
        )
        try:
            from gpu_router import route_and_call
            result = route_and_call(prompt, gemini_api_key=_gemini_key())
            txt = (result or {}).get("text", "").strip()
            if txt:
                data = json.loads(txt)
                corr = str(data.get("corrected", corrected)).strip() or corrected
                expl = str(data.get("explanation", "")).strip()
                if expl:
                    return {"corrected": corr, "explanation": expl}
        except Exception:
            pass

        # Fallback path: still give immediate, useful feedback.
        return {
            "corrected": corrected,
            "explanation": "Word order is off. In French, keep the verb close to the subject and place negation as ne + verb + pas."
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/ai/mistake-feedback")
def ai_mistake_feedback(req: AiMistakeFeedbackRequest):
    """
    Universal mistake feedback for any exercise mode.
    Returns concise correction + explanation + targeted next step.
    """
    try:
        prompt = (
            "You are an elite French tutor. Return strict JSON with keys: "
            "corrected, explanation, next_step. "
            "Constraints: explanation <= 2 short sentences, next_step <= 1 sentence.\n\n"
            f"CEFR: {req.cefr}\n"
            f"Exercise type: {req.q_type}\n"
            f"Prompt: {req.prompt}\n"
            f"Learner answer: {req.user_answer}\n"
            f"Expected answer: {req.expected_answer}\n"
            f"Reference note: {req.note}\n"
        )
        data = _ai_json_or_none(prompt)
        if data:
            return {
                "corrected": str(data.get("corrected", req.expected_answer)).strip() or req.expected_answer,
                "explanation": str(data.get("explanation", "Good effort. Focus on word order and agreement.")).strip(),
                "next_step": str(data.get("next_step", "Retry a similar sentence now.")).strip(),
            }
        return {
            "corrected": req.expected_answer,
            "explanation": "Good attempt. Compare your answer to the expected structure and watch agreement/order.",
            "next_step": "Retry one similar sentence immediately to lock it in.",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


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
        _ensure_core_db()
        xp_gain = 12 if req.correct else 4
        elo_gain = 10 if req.correct else -4
        with sqlite3.connect("cato_mind.db") as db:
            row = db.execute("SELECT xp, elo FROM learner WHERE id=1").fetchone()
            xp = (row[0] if row else 0) + xp_gain
            elo = max(700, min(2200, (row[1] if row else 800) + elo_gain))
            db.execute("UPDATE learner SET xp=?, elo=? WHERE id=1", (xp, elo))
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

@app.get("/api/word/{word}")
def lookup_word(word: str):
    """
    Tap-to-translate: look up a French word.
    Returns translation, IPA hint, and whether it's a known cognate.
    """
    try:
        import sqlite3
        word_lower = word.lower().strip(".,!?;:'\"«»—")
        with sqlite3.connect("cato_mind.db") as db:
            row = db.execute(
                "SELECT french, english, latin_root, is_cognate FROM vocabulary WHERE LOWER(french)=? LIMIT 1",
                (word_lower,)
            ).fetchone()
        if row:
            return {"french": row[0], "english": row[1],
                    "note": row[2], "is_cognate": bool(row[3]), "found": True}
        # Not in DB — ask Gemini for a quick translation
        return {"french": word, "english": "—", "note": None,
                "is_cognate": False, "found": False}
    except Exception as exc:
        return {"french": word, "english": "—", "found": False}


# ── Pattern Diagnosis ─────────────────────────────────────────────────────────

@app.get("/api/adaptive/pattern-diagnosis")
def pattern_diagnosis():
    """
    AI-powered analysis of the learner's mistake patterns.
    Surfaces specific grammatical diagnoses instead of raw skill tags.
    """
    try:
        import sqlite3
        _ensure_core_db()
        with sqlite3.connect("cato_mind.db") as db:
            rows = db.execute(
                """
                SELECT q_type, skill_tag, prompt, user_answer, expected_answer
                FROM adaptive_events
                WHERE correct = 0
                ORDER BY id DESC
                LIMIT 60
                """,
            ).fetchall()

        if len(rows) < 3:
            return {
                "patterns": [],
                "headline": "Keep practising — patterns will appear after a few mistakes.",
                "overall_advice": "",
            }

        mistakes = [
            {
                "type": r[0],
                "skill": r[1],
                "prompt": r[2],
                "yours": r[3],
                "correct": r[4],
            }
            for r in rows[:20]
        ]

        ai_prompt = (
            "You are a French language expert diagnosing a learner's error patterns. "
            "Return ONLY strict JSON with keys: headline (str), overall_advice (str), "
            "patterns (array of 1-3 objects with keys: tag, description, tip). "
            "description = 1 sentence naming the grammatical error pattern. "
            "tip = 1 actionable sentence the learner can act on immediately.\n\n"
            f"Recent mistakes (type / skill / prompt / learner-answer / correct-answer):\n"
            f"{json.dumps(mistakes, ensure_ascii=False)}"
        )

        data = _ai_json_or_none(ai_prompt)
        if data and isinstance(data.get("patterns"), list):
            return {
                "patterns": [
                    {
                        "tag": str(p.get("tag", "general")).strip(),
                        "description": str(p.get("description", "")).strip(),
                        "tip": str(p.get("tip", "")).strip(),
                    }
                    for p in data["patterns"][:3]
                    if p.get("description")
                ],
                "headline": str(data.get("headline", "Your weak spots:")).strip(),
                "overall_advice": str(data.get("overall_advice", "")).strip(),
            }

        # Fallback: simple frequency grouping
        by_skill: dict = {}
        for r in rows:
            by_skill[r[1]] = by_skill.get(r[1], 0) + 1
        top = sorted(by_skill.items(), key=lambda x: -x[1])[:3]
        return {
            "patterns": [
                {
                    "tag": t,
                    "description": f"{c} error(s) logged under '{t}'.",
                    "tip": f"Drill more {t} exercises to build the pattern.",
                }
                for t, c in top
            ],
            "headline": "Your weak spots:",
            "overall_advice": "Focus on the most frequent error first.",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ── AI-Generated Practice Questions ──────────────────────────────────────────

class GeneratePracticeRequest(BaseModel):
    cefr: str = "A1"
    skill_tag: str = "syntax"
    examples: list = []
    count: int = 5


@app.post("/api/ai/generate-practice")
def generate_practice(req: GeneratePracticeRequest):
    """
    Generate novel drill questions targeting a specific weak skill.
    Returns DrillQ-compatible objects (arrange or translate).
    """
    try:
        import re
        ex_lines = "\n".join(
            f"  • Prompt: {e.get('prompt', '')} | Answer: {e.get('answer', '')}"
            for e in (req.examples or [])[:5]
        ) or "  (no examples — use common French phrases)"

        ai_prompt = (
            f"Generate exactly {req.count} French drill questions for a {req.cefr} learner.\n"
            f"Target grammar skill: {req.skill_tag}\n"
            f"Example questions from this skill:\n{ex_lines}\n\n"
            f"Rules:\n"
            f"- Use different vocabulary from the examples but the SAME grammatical pattern.\n"
            f"- Keep difficulty appropriate for {req.cefr}.\n"
            f"- Mix 'arrange' and 'translate' types (at least 2 of each if count >= 4).\n"
            f"- For arrange: prompt = English sentence to reconstruct, answer = French sentence.\n"
            f"- For translate: prompt = 'Translate: \"<English>\"', answer = French sentence.\n"
            f"Return ONLY a JSON array: "
            f'[{{"type":"arrange"|"translate","prompt":"...","answer":"...","note":"brief grammar tip"}}]'
        )

        data = _ai_json_or_none(ai_prompt)
        if not isinstance(data, list):
            return {"questions": []}

        questions = []
        for item in data[: req.count + 2]:
            if not isinstance(item, dict):
                continue
            q_type = str(item.get("type", "translate")).strip()
            prompt = str(item.get("prompt", "")).strip()
            answer = str(item.get("answer", "")).strip()
            note   = str(item.get("note", "")).strip()
            if not prompt or not answer:
                continue
            q: dict = {
                "type": q_type if q_type in ("arrange", "translate") else "translate",
                "cefr": req.cefr,
                "unitId": f"{req.cefr.lower()}-ai-generated",
                "lessonType": "grammar_focus",
                "prompt": prompt,
                "answer": answer,
                "note": note,
                "isGenerated": True,
            }
            if q["type"] == "arrange":
                words = re.sub(r"([!?.,;:])", r" \1 ", answer)
                q["words"] = [w for w in words.split() if w]
                # Ensure direction field absent for translate (not needed for arrange)
            else:
                q["direction"] = "en-fr"
            questions.append(q)
            if len(questions) >= req.count:
                break

        return {"questions": questions}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


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
