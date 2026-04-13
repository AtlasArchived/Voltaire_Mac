#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Voltaire — Mac Launcher
#
#  ./start.sh              → one Terminal window, logs, Ctrl+C stops all
#  ./start.sh --headless   → no Terminal UI; servers survive (use Stop Voltaire.app)
#  Double-click Voltaire.app → same as --headless
# ─────────────────────────────────────────────────────────────

HEADLESS=false
[ "${1:-}" = "--headless" ] && HEADLESS=true

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
mkdir -p "$DIR/logs"

if [ "$HEADLESS" = true ]; then
  exec >>"$DIR/logs/launcher.log" 2>&1
fi

[ -t 1 ] && [ "$HEADLESS" = false ] && clear || true

echo ""
echo "  VOLTAIRE — French Fluency for Life"
echo "  ===================================="
echo ""

# ── Load .env ────────────────────────────────────────────────
if [ -f "$DIR/.env" ]; then
  while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    export "$key"="$value"
  done < "$DIR/.env"
fi

# ── Find Python ──────────────────────────────────────────────
PY=""
for cmd in python3.12 python3.11 python3.10 python3 python; do
  if command -v "$cmd" &>/dev/null; then PY="$cmd"; break; fi
done

if [ -z "$PY" ]; then
  echo "  ERROR: Python not found."
  echo "  Install: brew install python  OR  https://python.org"
  open "https://python.org/downloads/macos/" 2>/dev/null
  [ "$HEADLESS" = true ] && osascript -e 'display alert "Voltaire" message "Python not found. Install from python.org or run brew install python." as critical'
  exit 1
fi
echo "  Python: $($PY --version 2>&1)"

# ── Find Node ────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "  ERROR: Node.js not found."
  echo "  Install: brew install node  OR  https://nodejs.org"
  open "https://nodejs.org/en/download/" 2>/dev/null
  [ "$HEADLESS" = true ] && osascript -e 'display alert "Voltaire" message "Node.js not found. Install from nodejs.org or run brew install node." as critical'
  exit 1
fi
echo "  Node.js: $(node --version 2>&1)"

# ── Database ─────────────────────────────────────────────────
if [ ! -f "$DIR/cato_mind.db" ] && [ -f "$DIR/init_db.py" ]; then
  echo "  Setting up database..."
  $PY init_db.py && echo "  Database ready"
fi

# ── Python packages ──────────────────────────────────────────
if ! $PY -c "import fastapi, uvicorn" 2>/dev/null; then
  echo "  Installing Python packages (one time)..."
  if [ -f "$DIR/requirements.txt" ]; then
    $PY -m pip install -r "$DIR/requirements.txt" --quiet \
      --break-system-packages 2>/dev/null \
      || $PY -m pip install -r "$DIR/requirements.txt" --quiet
  else
    $PY -m pip install fastapi "uvicorn[standard]" google-generativeai \
      google-genai requests feedparser edge-tts gTTS --quiet \
      --break-system-packages 2>/dev/null \
      || $PY -m pip install fastapi "uvicorn[standard]" google-generativeai \
         google-genai requests feedparser edge-tts gTTS --quiet
  fi
  echo "  Python packages installed"
fi

# ── Frontend packages ────────────────────────────────────────
if [ ! -d "$DIR/frontend/node_modules" ]; then
  echo "  Installing frontend packages (one time, ~2 min)..."
  cd "$DIR/frontend" && npm install --silent && cd "$DIR"
  echo "  Frontend packages installed"
fi

echo ""
if [ -z "$CATO_GEMINI_KEY" ]; then
  echo "  NOTE: No Gemini API key. Add to .env: CATO_GEMINI_KEY=your_key"
  echo "  Free key: https://aistudio.google.com"
else
  echo "  Gemini API key: found"
fi
echo ""

# ── Helpers ──────────────────────────────────────────────────
is_up_backend() {
  curl -fsS --max-time 3 "$1" >/dev/null 2>&1
}

is_up_frontend() {
  local code
  code="$(curl -sS --max-time 3 -o /dev/null -w "%{http_code}" "$1" 2>/dev/null || true)"
  [ -n "$code" ] && [ "$code" != "000" ]
}

wait_for() {
  local name="$1"
  local url="$2"
  local kind="${3:-backend}"
  local tries=90
  while [ $tries -gt 0 ]; do
    if [ "$kind" = frontend ]; then
      if is_up_frontend "$url"; then
        echo "  $name: ready (HTTP server responding)"
        return 0
      fi
    else
      if is_up_backend "$url"; then
        echo "  $name: ready"
        return 0
      fi
    fi
    sleep 1
    tries=$((tries-1))
  done
  echo "  ERROR: $name did not become ready at $url"
  return 1
}

cleanup_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:$port 2>/dev/null | tr '\n' ' ')"
  if [ -n "$pids" ]; then
    echo "  Port $port busy. Stopping old process(es): $pids"
    kill $pids 2>/dev/null || true
    sleep 1
    pids="$(lsof -ti tcp:$port 2>/dev/null | tr '\n' ' ')"
    [ -n "$pids" ] && kill -9 $pids 2>/dev/null || true
  fi
}

stop_voltaire() {
  echo ""
  echo "  Stopping Voltaire (freeing ports 8000 and 3000)..."
  cleanup_port 8000
  cleanup_port 3000
}

# ── Preflight ports ──────────────────────────────────────────
cleanup_port 8000
cleanup_port 3000

touch "$DIR/logs/backend.log" "$DIR/logs/frontend.log"

# ── Start backend ───────────────────────────────────────────
echo "  Starting backend (logging to logs/backend.log)..."
if [ "$HEADLESS" = true ]; then
  nohup bash -c "cd \"$DIR\" && exec $PY -m uvicorn backend.main:app --port 8000 --host 0.0.0.0" \
    >>"$DIR/logs/backend.log" 2>&1 </dev/null &
  disown 2>/dev/null || true
else
  (
    cd "$DIR" && exec $PY -m uvicorn backend.main:app --port 8000 --host 0.0.0.0
  ) >>"$DIR/logs/backend.log" 2>&1 &
fi

if ! wait_for "Backend" "http://localhost:8000/api/health"; then
  echo "  Backend failed to start. See logs/backend.log"
  stop_voltaire
  [ "$HEADLESS" = true ] && osascript -e 'display alert "Voltaire" message "Backend did not start. See logs/backend.log in the Voltaire folder." as critical'
  exit 1
fi

# ── Start frontend (production build if present; override with VOLTAIRE_FORCE_DEV=1) ──
USE_NEXT_START=false
if [ -f "$DIR/frontend/.next/BUILD_ID" ] && [ -z "${VOLTAIRE_FORCE_DEV:-}" ]; then
  USE_NEXT_START=true
fi

echo "  Starting frontend (logging to logs/frontend.log)..."
if [ "$HEADLESS" = true ]; then
  if [ "$USE_NEXT_START" = true ]; then
    nohup bash -c "cd \"$DIR/frontend\" && export NODE_ENV=production && exec npm run start" \
      >>"$DIR/logs/frontend.log" 2>&1 </dev/null &
  else
    nohup bash -c "cd \"$DIR/frontend\" && exec npm run dev" \
      >>"$DIR/logs/frontend.log" 2>&1 </dev/null &
  fi
  disown 2>/dev/null || true
else
  if [ "$USE_NEXT_START" = true ]; then
    (
      cd "$DIR/frontend" && export NODE_ENV=production && exec npm run start
    ) >>"$DIR/logs/frontend.log" 2>&1 &
  else
    (
      cd "$DIR/frontend" && exec npm run dev
    ) >>"$DIR/logs/frontend.log" 2>&1 &
  fi
fi

if ! wait_for "Frontend" "http://localhost:3000" frontend; then
  echo "  Frontend failed to start. See logs/frontend.log"
  stop_voltaire
  [ "$HEADLESS" = true ] && osascript -e 'display alert "Voltaire" message "Frontend did not start. See logs/frontend.log in the Voltaire folder." as critical'
  exit 1
fi

# ── Desktop app (Electron) — uses existing servers, no default browser ─────────
if [ ! -d "$DIR/node_modules/electron" ] && [ -f "$DIR/package.json" ]; then
  echo "  Installing Electron (one time, project root)..."
  (cd "$DIR" && npm install --silent) || true
fi

if [ -d "$DIR/node_modules/electron" ] || [ -x "$DIR/node_modules/.bin/electron" ]; then
  echo "  Opening Voltaire desktop window (Electron)..."
  touch "$DIR/logs/electron.log"
  export VOLTAIRE_EXTERNAL_SERVER=1
  if [ "$HEADLESS" = true ]; then
    nohup bash -c "cd \"$DIR\" && exec env VOLTAIRE_EXTERNAL_SERVER=1 npm run desktop" \
      >>"$DIR/logs/electron.log" 2>&1 </dev/null &
    disown 2>/dev/null || true
  else
    ( cd "$DIR" && exec env VOLTAIRE_EXTERNAL_SERVER=1 npm run desktop ) >>"$DIR/logs/electron.log" 2>&1 &
  fi
else
  echo "  NOTE: Electron not installed; open http://localhost:3000 in a browser, or run: cd \"$DIR\" && npm install && ./start.sh"
  open http://localhost:3000
fi

LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)

if [ "$HEADLESS" = true ]; then
  echo "  Headless launch complete at $(date '+%Y-%m-%d %H:%M:%S')"
  osascript -e 'display notification "Voltaire is running — desktop app or localhost:3000" with title "Voltaire"'
  exit 0
fi

echo ""
echo "  Voltaire is running!"
echo "  App:      http://localhost:3000  (Electron window if installed, else browser)"
[ -n "$LOCAL_IP" ] && echo "  Phone:    http://$LOCAL_IP:3000"
echo "  Logs:     $DIR/logs/"
echo ""
echo "  This window streams backend + frontend logs."
echo "  Press Ctrl+C here to stop Voltaire."
echo ""

tail -f "$DIR/logs/backend.log" "$DIR/logs/frontend.log" 2>/dev/null &
TAILPID=$!

finish() {
  kill "$TAILPID" 2>/dev/null || true
  stop_voltaire
  exit 0
}
trap finish INT TERM HUP

wait "$TAILPID" || true
finish
