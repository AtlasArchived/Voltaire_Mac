#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Voltaire — Mac Setup Script
#  Run this ONCE to set everything up from scratch.
#  After setup, use start.sh to launch Voltaire.
# ─────────────────────────────────────────────────────────────

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
clear

echo ""
echo "  VOLTAIRE — Mac Setup"
echo "  ===================="
echo "  This will install everything you need."
echo "  Takes about 7–10 minutes on first run (includes frontend production build)."
echo ""
sleep 2

# ── Step 1: Homebrew ─────────────────────────────────────────
echo "  [1/7] Checking Homebrew..."
if ! command -v brew &>/dev/null; then
  echo "  Installing Homebrew (Mac package manager)..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Add brew to PATH for Apple Silicon
  if [ -f "/opt/homebrew/bin/brew" ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  fi
else
  echo "  Homebrew: already installed"
fi

# ── Step 2: Python ───────────────────────────────────────────
echo "  [2/7] Checking Python..."
if ! command -v python3 &>/dev/null; then
  echo "  Installing Python 3..."
  brew install python
else
  echo "  Python: $(python3 --version 2>&1)"
fi

# ── Step 3: Node.js ──────────────────────────────────────────
echo "  [3/7] Checking Node.js..."
if ! command -v node &>/dev/null; then
  echo "  Installing Node.js..."
  brew install node
else
  echo "  Node.js: $(node --version 2>&1)"
fi

# ── Step 4: Python packages ──────────────────────────────────
echo "  [4/7] Installing Python packages..."
if [ -f "$DIR/requirements.txt" ]; then
  python3 -m pip install -r "$DIR/requirements.txt" \
    --quiet --break-system-packages 2>/dev/null \
    || python3 -m pip install -r "$DIR/requirements.txt" --quiet
else
  python3 -m pip install fastapi "uvicorn[standard]" google-generativeai google-genai \
    requests schedule feedparser edge-tts gTTS --quiet --break-system-packages 2>/dev/null \
    || python3 -m pip install fastapi "uvicorn[standard]" google-generativeai google-genai \
       requests schedule feedparser edge-tts gTTS --quiet
fi
echo "  Python packages: done"

# ── Step 5: Frontend packages ────────────────────────────────
echo "  [5/7] Installing frontend packages (this takes ~2 min)..."
if [ -d "$DIR/frontend" ]; then
  cd "$DIR/frontend"
  npm install --silent
  cd "$DIR"
  echo "  Frontend packages: done"
else
  echo "  WARNING: frontend/ folder not found. Make sure you extracted all Voltaire files."
fi

echo "  [6/7] Building frontend for production (faster launches)..."
if [ -d "$DIR/frontend" ]; then
  (cd "$DIR/frontend" && NODE_ENV=production npm run build) || {
    echo "  WARNING: frontend build failed — start.sh will use dev mode until build succeeds."
  }
else
  echo "  Skipped (no frontend/)."
fi

# ── Step 7: Database ─────────────────────────────────────────
echo "  [7/7] Initializing database..."
if [ -f "$DIR/init_db.py" ]; then
  (cd "$DIR" && python3 init_db.py) && echo "  Database: ready"
else
  echo "  WARNING: init_db.py missing — database will be created on first API use."
fi

# ── Make scripts executable ───────────────────────────────────
chmod +x "$DIR/start.sh" "$DIR/tunnel.sh" "$DIR/install_mac.sh" "$DIR/stop_voltaire.sh" 2>/dev/null

# ── .env setup ───────────────────────────────────────────────
echo ""
if [ ! -f "$DIR/.env" ] && [ -f "$DIR/.env.example" ]; then
  cp "$DIR/.env.example" "$DIR/.env"
  echo "  Created .env from template."
fi

echo ""
echo "  ============================================"
echo "  Setup complete!"
echo ""
echo "  NEXT STEP: Add your Gemini API key:"
echo "  1. Get free key: https://aistudio.google.com"
echo "  2. Open: $DIR/.env"
echo "  3. Add:  CATO_GEMINI_KEY=your_key_here"
echo ""
echo "  THEN: Double-click start.sh to launch Voltaire"
echo "  ============================================"
echo ""

# Open .env in default text editor
if [ -f "$DIR/.env" ]; then
  echo "  Opening .env so you can add your key..."
  sleep 1
  open "$DIR/.env"
fi
