#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Voltaire — Mac Launcher
#  Usage: double-click in Finder, or run: ./start.sh
# ─────────────────────────────────────────────────────────────

HEADLESS=false
[ "${1:-}" = "--headless" ] && HEADLESS=true
ANYWHERE="${VOLTAIRE_ANYWHERE:-1}"

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
clear

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
  exit 1
fi
echo "  Python: $($PY --version 2>&1)"

# ── Find Node ────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "  ERROR: Node.js not found."
  echo "  Install: brew install node  OR  https://nodejs.org"
  open "https://nodejs.org/en/download/" 2>/dev/null
  exit 1
fi
echo "  Node.js: $(node --version 2>&1)"

# ── Database ─────────────────────────────────────────────────
if [ ! -f "$DIR/cato_mind.db" ]; then
  echo "  Setting up database..."
  $PY init_db.py && echo "  Database ready"
fi

# ── Python packages ──────────────────────────────────────────
if ! $PY -c "import fastapi, uvicorn" 2>/dev/null; then
  echo "  Installing Python packages (one time)..."
  $PY -m pip install fastapi "uvicorn[standard]" google-generativeai \
    google-genai requests feedparser edge-tts gTTS --quiet \
    --break-system-packages 2>/dev/null \
    || $PY -m pip install fastapi "uvicorn[standard]" google-generativeai \
       google-genai requests feedparser edge-tts gTTS --quiet
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
is_up() {
  local url="$1"
  curl -fsS --max-time 2 "$url" >/dev/null 2>&1
}

wait_for() {
  local name="$1"
  local url="$2"
  local tries=30
  while [ $tries -gt 0 ]; do
    if is_up "$url"; then
      echo "  $name: ready"
      return 0
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
  if [ -x "$DIR/tunnel.sh" ]; then
    "$DIR/tunnel.sh" --stop >/dev/null 2>&1 || true
  fi
  cleanup_port 8000
  cleanup_port 3000
}


# ── Preflight ports ──────────────────────────────────────────
cleanup_port 8000
cleanup_port 3000

# ── Start backend in new Terminal window ────────────────────
echo "  Starting backend..."
osascript - "$DIR" "$PY" << 'EOF'
on run {dir, py}
  tell application "Terminal"
    activate
    do script "cd '" & dir & "' && " & py & " -m uvicorn backend.main:app --port 8000 --host 0.0.0.0"
  end tell
end run
EOF

if ! wait_for "Backend" "http://localhost:8000/api/health"; then
  echo "  Backend failed to start. Check the backend Terminal window for errors."
  exit 1
fi

# ── Start frontend in new Terminal window ───────────────────
echo "  Starting frontend..."
osascript - "$DIR" << 'EOF'
on run {dir}
  tell application "Terminal"
    activate
    do script "cd '" & dir & "/frontend' && npm run dev"
  end tell
end run
EOF

if ! wait_for "Frontend" "http://localhost:3000"; then
  echo "  Frontend failed to start. Check the frontend Terminal window for errors."
  exit 1
fi

echo "  Opening browser..."
open http://localhost:3000

LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
PUBLIC_URL=""

# ── Anywhere access (auto Cloudflare tunnel; disable with VOLTAIRE_ANYWHERE=0) ──
if [ "$ANYWHERE" = "1" ] && [ -x "$DIR/tunnel.sh" ]; then
  echo "  Starting secure public tunnel for anywhere phone access..."
  "$DIR/tunnel.sh" --background >>"$DIR/logs/launcher.log" 2>&1 || true
  if [ -f "$DIR/logs/public_url.txt" ]; then
    PUBLIC_URL="$(<"$DIR/logs/public_url.txt")"
  fi
fi

if [ "$HEADLESS" = true ]; then
  echo "  Headless launch complete at $(date '+%Y-%m-%d %H:%M:%S')"
  if [ -n "$PUBLIC_URL" ]; then
    osascript -e "display notification \"$PUBLIC_URL\" with title \"Voltaire public link\""
  else
    osascript -e 'display notification "Voltaire is running — desktop app or localhost:3000" with title "Voltaire"'
  fi
  exit 0
fi


echo ""
echo "  Voltaire is running!"
echo "  Browser:  http://localhost:3000"
[ -n "$LOCAL_IP" ] && echo "  Phone:    http://$LOCAL_IP:3000"
[ -n "$PUBLIC_URL" ] && echo "  Anywhere: $PUBLIC_URL"
echo "  Logs:     $DIR/logs/"
echo ""
echo "  Close the backend/frontend Terminal windows to stop."
