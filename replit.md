# Voltaire — French Fluency App

AI-powered French language tutor with a Next.js frontend and FastAPI Python backend.

## Architecture

- **Frontend**: Next.js 14 (React, TypeScript, Tailwind CSS) — runs on port 5000
- **Backend**: FastAPI (Python) — runs on port 8000
- **Database**: SQLite (`cato_mind.db`) for local persistence
- **AI**: Gemini API (via `CATO_GEMINI_KEY` env var)

## Project Structure

```
frontend/        — Next.js app
  app/           — Next.js App Router pages
  components/    — React components (Onboarding, VoiceMode, StoryPlayer)
  lib/           — Typed API client, grammar data, course builder, question bank
backend/
  main.py        — FastAPI server (all endpoints)
  bundled_stories.py — Offline story content fallback
```

## Running Locally on Replit

Two workflows are configured:
- **Backend API** — `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`
- **Start application** — `cd frontend && npm run dev` (port 5000)

The Next.js frontend proxies all `/api/*` requests to the backend on port 8000 (configured in `next.config.js` rewrites).

## Environment Variables

- `CATO_GEMINI_KEY` — Gemini API key for AI features (required for tutor/chat functionality)
- `BACKEND_URL` — Override backend URL (defaults to `http://localhost:8000`)

## Key Notes

- `frontend/lib/questionBank.ts` contains French phrases that were originally written with Unicode smart quotes — these have been converted to standard double-quote strings for TypeScript compatibility.
- The backend gracefully falls back when optional modules (`gpu_router`, `curriculum`, `mathieu`) are not installed.
- Originally a Mac desktop Electron app; adapted for Replit web deployment.
