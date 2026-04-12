"""
Bundled story content when optional `stories` / `curriculum` packages are absent.
Unlock rules align with frontend CEFR ELO bands.
"""
from __future__ import annotations

import json
from types import SimpleNamespace

CEFR_MIN_ELO = {"A1": 0, "A2": 1000, "B1": 1200, "B2": 1400, "C1": 1600, "C2": 1800}


def story_unlocked_for_elo(story_cefr: str, elo: int) -> bool:
    return elo >= CEFR_MIN_ELO.get(story_cefr.upper(), 0)


def _line(speaker: str, french: str, english: str, audio_hint: str = "", glosses: dict | None = None):
    return SimpleNamespace(
        speaker=speaker,
        french=french,
        english=english,
        audio_hint=audio_hint or french,
        glosses=glosses or {},
    )


def _q(question_fr: str, question_en: str, options: list, correct: int, explanation: str):
    return SimpleNamespace(
        question_fr=question_fr,
        question_en=question_en,
        options=options,
        correct=correct,
        explanation=explanation,
    )


def _story(
    sid: str,
    title_fr: str,
    title_en: str,
    setting: str,
    cefr: str,
    emoji: str,
    culture_note: str,
    vocab_focus: list,
    lines,
    questions,
):
    return SimpleNamespace(
        id=sid,
        title_fr=title_fr,
        title_en=title_en,
        setting=setting,
        cefr=cefr,
        emoji=emoji,
        culture_note=culture_note,
        vocab_focus=vocab_focus,
        lines=lines,
        questions=questions,
    )


BUNDLED_STORIES = [
    _story(
        "bundled-a1-cafe",
        "Au café",
        "At the café",
        "Paris",
        "A1",
        "☕",
        "Ordering politely with je voudrais is very common.",
        ["un café", "s'il vous plaît", "merci"],
        [
            _line("Serveur", "Bonjour ! Vous désirez ?", "Hello! What would you like?", "Bonjour ! Vous désirez ?"),
            _line("Vous", "Bonjour. Je voudrais un café, s'il vous plaît.", "Hello. I would like a coffee, please."),
            _line("Serveur", "Très bien. Autre chose ?", "Very well. Anything else?", "Très bien. Autre chose ?"),
            _line("Vous", "Non, merci.", "No, thank you."),
        ],
        [
            _q(
                "Que commande le client ?",
                "What does the customer order?",
                ["Un thé", "Un café", "Un jus"],
                1,
                "Je voudrais un café.",
            ),
            _q(
                "Comment dit-on poliment « please » ?",
                "How do you say « please » politely?",
                ["Merci", "S'il vous plaît", "Bonjour"],
                1,
                "S'il vous plaît is the polite form.",
            ),
        ],
    ),
    _story(
        "bundled-a2-hotel",
        "À l'hôtel",
        "At the hotel",
        "Lyon",
        "A2",
        "🏨",
        "Check-in vocabulary is useful for travel.",
        ["réservation", "clé", "ascenseur"],
        [
            _line("Réception", "Bonsoir. Vous avez une réservation ?", "Good evening. Do you have a reservation?"),
            _line("Vous", "Oui, au nom de Dupont.", "Yes, under the name Dupont."),
            _line("Réception", "Parfait. Voici votre clé. L'ascenseur est à gauche.", "Perfect. Here is your key. The elevator is on the left."),
        ],
        [
            _q(
                "Sous quel nom est la réservation ?",
                "Under what name is the reservation?",
                ["Martin", "Dupont", "Bernard"],
                1,
                "Au nom de Dupont.",
            ),
            _q(
                "Où se trouve l'ascenseur ?",
                "Where is the elevator?",
                ["À droite", "À gauche", "Derrière"],
                1,
                "À gauche.",
            ),
        ],
    ),
    _story(
        "bundled-b1-pharma",
        "À la pharmacie",
        "At the pharmacy",
        "Nice",
        "B1",
        "💊",
        "Explain symptoms simply with « J'ai mal à… ».",
        ["douleur", "ordonnance", "sirop"],
        [
            _line("Pharmacien", "Bonjour. Qu'est-ce qui ne va pas ?", "Hello. What is wrong?"),
            _line("Vous", "J'ai mal à la gorge depuis deux jours.", "My throat has hurt for two days."),
            _line("Pharmacien", "Je vous propose ce sirop. Trois fois par jour.", "I suggest this syrup. Three times a day."),
        ],
        [
            _q(
                "Quel est le problème du client ?",
                "What is the customer's problem?",
                ["Mal au ventre", "Mal à la gorge", "Fièvre forte"],
                1,
                "J'ai mal à la gorge.",
            ),
        ],
    ),
    _story(
        "bundled-b2-debat",
        "Le débat citoyen",
        "The civic debate",
        "Brussels",
        "B2",
        "🎤",
        "Formal connectors: néanmoins, toutefois, en revanche.",
        ["néanmoins", "enjeux", "nuancer"],
        [
            _line("Modérateur", "Faut-il limiter les voitures en centre-ville ?", "Should cars be limited downtown?"),
            _line("Intervenant", "Néanmoins, il faut nuancer : certaines familles en ont besoin.", "Nevertheless, we must qualify: some families need them."),
            _line("Modérateur", "Merci. Prochain argument ?", "Thanks. Next argument?"),
        ],
        [
            _q(
                "Quel connecteur l'intervenant utilise-t-il ?",
                "Which connector does the speaker use?",
                ["Pourtant", "Néanmoins", "Cependant uniquement en début"],
                1,
                "Néanmoins introduit une nuance.",
            ),
        ],
    ),
    _story(
        "bundled-c1-editorial",
        "Éditorial",
        "Editorial voice",
        "Genève",
        "C1",
        "📰",
        "Register: il convient de, force est de constater.",
        ["nuancer", "posture", "argumentation"],
        [
            _line("Journaliste", "Il convient de distinguer opinion et faits établis.", "One should distinguish opinion from established facts."),
            _line("Journaliste", "Force est de constater que la polarisation s'accentue.", "It must be acknowledged that polarization is intensifying."),
        ],
        [
            _q(
                "Quelle tournure formelle apparaît ?",
                "Which formal phrasing appears?",
                ["Il faut que", "Il convient de", "On doit"],
                1,
                "Il convient de + infinitif est très soutenu.",
            ),
        ],
    ),
]

BUNDLED_STORY_MAP = {s.id: s for s in BUNDLED_STORIES}


def bundled_get_story_progress(db_path: str = "cato_mind.db") -> dict:
    import sqlite3

    out: dict = {}
    try:
        with sqlite3.connect(db_path) as db:
            rows = db.execute(
                "SELECT key, value FROM app_settings WHERE key LIKE 'story_prog_%'"
            ).fetchall()
        for k, v in rows:
            sid = k.replace("story_prog_", "", 1)
            try:
                out[sid] = json.loads(v)
            except Exception:
                out[sid] = {"attempts": 0}
    except Exception:
        pass
    return out


def bundled_save_story_result(story_id: str, score: int, total: int, db_path: str = "cato_mind.db") -> None:
    import sqlite3

    total = max(int(total or 0), 1)
    score = max(0, min(int(score or 0), total))
    pct = int(round(100 * score / total))
    prev = bundled_get_story_progress(db_path).get(story_id, {})
    attempts = int(prev.get("attempts", 0)) + 1
    best = max(int(prev.get("score", 0) or 0), pct)
    payload = {
        "completed": score,
        "total": total,
        "score": best,
        "attempts": attempts,
    }
    with sqlite3.connect(db_path) as db:
        db.execute(
            "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
            (f"story_prog_{story_id}", json.dumps(payload)),
        )


def bundled_stories_api_payload(elo: int, db_path: str = "cato_mind.db") -> list:
    progress = bundled_get_story_progress(db_path)
    out = []
    for s in BUNDLED_STORIES:
        unlocked = story_unlocked_for_elo(s.cefr, elo)
        out.append(
            {
                "id": s.id,
                "title_fr": s.title_fr,
                "title_en": s.title_en,
                "setting": s.setting,
                "cefr": s.cefr,
                "emoji": s.emoji,
                "unlocked": unlocked,
                "progress": progress.get(s.id, {}),
                "vocab_focus": list(s.vocab_focus),
                "culture_note": s.culture_note,
            }
        )
    return out


def story_to_detail_dict(s) -> dict:
    return {
        "id": s.id,
        "title_fr": s.title_fr,
        "title_en": s.title_en,
        "setting": s.setting,
        "cefr": s.cefr,
        "emoji": s.emoji,
        "culture_note": s.culture_note,
        "vocab_focus": list(s.vocab_focus),
        "lines": [
            {
                "speaker": l.speaker,
                "french": l.french,
                "english": l.english,
                "audio_hint": l.audio_hint,
                "glosses": dict(l.glosses),
            }
            for l in s.lines
        ],
        "questions": [
            {
                "question_fr": q.question_fr,
                "question_en": q.question_en,
                "options": list(q.options),
                "correct": q.correct,
                "explanation": q.explanation,
            }
            for q in s.questions
        ],
    }
