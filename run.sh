#!/bin/bash
# Voltaire — Replit Launcher
# Starts FastAPI backend (port 8000) and Next.js frontend (port 5000)

DIR="$(cd "$(dirname "$0")" && pwd)"

# Start backend in background
cd "$DIR/backend"
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Next.js frontend in foreground
cd "$DIR/frontend"
npm run dev

# If frontend exits, kill backend too
kill $BACKEND_PID 2>/dev/null
