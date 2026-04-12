# Voltaire Rollout Audit Report

Date: 2026-04-06

## Scope
- Curriculum refactor and unitized progression
- Ordered unlock and checkpoint pathing
- Adaptive v2 event telemetry and recommendations
- Tab completion (Course, Review, Stories, Settings)
- Stability and fallback checks

## Functional Audit
- Learn mode now runs on unitized questions with `unitId` and lesson type metadata.
- Course map includes explicit current unit selector and unlocked unit progression controls.
- CEFR checkpoints are operational with pass/fail persistence and retry cooldown logic.
- Adaptive review exposes weak-skill report and review queue endpoints.
- Review tab now surfaces weak skills, focus prompts, and targeted queue actions.
- Stories tab consumes backend stories with fallback card rendering if unavailable.
- Settings supports persisted `daily_goal_xp`, `difficulty_bias`, `correction_strictness`, and `audio_speed`.

## Data Audit
- `adaptive_events` now records `cefr` and `skill_tag`.
- DB migration guard adds missing adaptive columns automatically in existing DBs.
- Checkpoint persistence includes mission pass/fail plus fail counters and cooldown timestamps.
- Unit checkpoint endpoint persists per-unit status under `unit_checkpoint_<unit_id>`.

## Build & Runtime Audit
- Frontend production build: PASS (`cd frontend && npm run build`)
- Backend import smoke test: PASS (`from backend.main import app`)
- Typed lint diagnostics for edited files: PASS (no IDE lint errors)

## Stability Notes
- AI-dependent features keep deterministic fallback behavior.
- Stories and review flows degrade gracefully when backend calls fail.
- Checkpoint endpoint returns explicit cooldown recommendation instead of hard failure.

## Remaining Risk
- Unit/lesson completion is currently persisted via settings and runtime state; if you want strict server-authoritative per-lesson completion tables, that would be the next hardening slice.

## Final Max Pass Additions
- Added adaptive recency-decay weighting to review queue ordering (`age_days` + forgetting pressure).
- Added `GET /api/adaptive/next-best-lesson` for deterministic "what should I do now" recommendations.
- Added `GET /api/c2/status` and surfaced C2 readiness in Settings.
- Added timeout-based centralized API request protection in frontend client (`REQUEST_TIMEOUT_MS`).
- Surfaced Next Best Lesson guidance in Course and Review.

## Final Verification
- Frontend build after final pass: PASS.
- Backend smoke checks for new endpoints: PASS.
- Lint diagnostics for changed files: PASS.

## Tab stability + Babbel/Duolingo-style pass (bundle without optional Python modules)
- **Settings**: `GET/POST /api/settings` use SQLite only (no `onboarding` import).
- **Stories**: [`backend/bundled_stories.py`](backend/bundled_stories.py) supplies five CEFR-gated scenarios; progress in `app_settings` keys `story_prog_*`; full player + quiz in [`frontend/components/StoryPlayer.tsx`](frontend/components/StoryPlayer.tsx).
- **Review cards / drill / lesson state**: return empty or ELO-derived lesson state instead of HTTP 500 when optional modules are missing.
- **Mathieu**: `DELETE /api/mathieu/history` returns `{ok: true}` if module missing.
- **Course map**: lesson rows jump to **Learn** with `currentUnitId` mapped from [`UNIT_META`](frontend/lib/questionBank.ts).
- **Voice**: final transcript from `SpeechRecognition` results ref; browser `SpeechSynthesis` fallback when MP3 is missing or fails.
- **Grammar**: first visit pre-fills search from top weak skill tag (once per visit).
- **Verification**: `npm run build` PASS; `TestClient` checks for `/api/health`, `/api/settings`, `/api/stories`, `/api/review/cards`, `/api/lesson/state`, story GET/POST complete, mathieu DELETE — all 200.
