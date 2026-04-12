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
echo "  Takes about 5 minutes on first run."
echo ""
sleep 2

# ── Step 1: Homebrew ─────────────────────────────────────────
echo "  [1/6] Checking Homebrew..."
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
echo "  [2/6] Checking Python..."
if ! command -v python3 &>/dev/null; then
  echo "  Installing Python 3..."
  brew install python
else
  echo "  Python: $(python3 --version 2>&1)"
fi

# ── Step 3: Node.js ──────────────────────────────────────────
echo "  [3/6] Checking Node.js..."
if ! command -v node &>/dev/null; then
  echo "  Installing Node.js..."
  brew install node
else
  echo "  Node.js: $(node --version 2>&1)"
fi

# ── Step 4: Python packages ──────────────────────────────────
echo "  [4/6] Installing Python packages..."
python3 -m pip install \
  fastapi \
  "uvicorn[standard]" \
  google-generativeai \
  google-genai \
  requests \
  schedule \
  feedparser \
  pyTelegramBotAPI \
  edge-tts \
  gTTS \
  openai-whisper \
  soundfile \
  numpy \
  --quiet --break-system-packages 2>/dev/null \
|| python3 -m pip install \
  fastapi \
  "uvicorn[standard]" \
  google-generativeai \
  google-genai \
  requests schedule feedparser edge-tts gTTS --quiet
echo "  Python packages: done"

# ── Step 5: Frontend packages ────────────────────────────────
echo "  [5/6] Installing frontend packages (this takes ~2 min)..."
if [ -d "$DIR/frontend" ]; then
  cd "$DIR/frontend"
  npm install --silent
  cd "$DIR"
  echo "  Frontend packages: done"
else
  echo "  WARNING: frontend/ folder not found. Make sure you extracted all Voltaire files."
fi

# ── Step 6: Database ─────────────────────────────────────────
echo "  [6/6] Initializing database..."
if [ ! -f "$DIR/cato_mind.db" ]; then
  python3 init_db.py && echo "  Database: ready"
else
  echo "  Database: already exists"
fi

# ── Make scripts executable ───────────────────────────────────
chmod +x "$DIR/start.sh" "$DIR/tunnel.sh" 2>/dev/null

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
