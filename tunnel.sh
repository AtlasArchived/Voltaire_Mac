#!/bin/bash
# Voltaire — Anywhere Access via Cloudflare Tunnel
# Modes:
#   ./tunnel.sh               -> foreground URL (manual use)
#   ./tunnel.sh --background  -> start tunnel in background, save URL
#   ./tunnel.sh --stop        -> stop background tunnel

set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
mkdir -p "$DIR/logs"

PID_FILE="$DIR/logs/cloudflared.pid"
URL_FILE="$DIR/logs/public_url.txt"
LOG_FILE="$DIR/logs/cloudflared.log"

ensure_cloudflared() {
  if command -v cloudflared &>/dev/null; then
    return 0
  fi
  echo "  Installing cloudflared..."
  if command -v brew &>/dev/null; then
    brew install cloudflared
  else
    ARCH="$(uname -m)"
    if [ "$ARCH" = "arm64" ]; then
      URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz"
    else
      URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz"
    fi
    echo "  Downloading cloudflared for $ARCH..."
    curl -L "$URL" | tar xz -C /tmp/
    sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared
  fi
}

stop_tunnel() {
  if [ -f "$PID_FILE" ]; then
    PID="$(cat "$PID_FILE" 2>/dev/null || true)"
    if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
      kill "$PID" 2>/dev/null || true
      sleep 0.4
      kill -9 "$PID" 2>/dev/null || true
    fi
    rm -f "$PID_FILE"
  fi
  rm -f "$URL_FILE"
}

wait_for_url() {
  local tries=80
  while [ $tries -gt 0 ]; do
    if [ -f "$LOG_FILE" ]; then
      URL="$(rg -o "https://[a-zA-Z0-9.-]+trycloudflare.com" "$LOG_FILE" | head -n 1 || true)"
      if [ -n "${URL:-}" ]; then
        echo "$URL" > "$URL_FILE"
        echo "$URL"
        return 0
      fi
    fi
    sleep 0.5
    tries=$((tries-1))
  done
  return 1
}

if [ "${1:-}" = "--stop" ]; then
  stop_tunnel
  echo "  Cloudflare tunnel stopped."
  exit 0
fi

ensure_cloudflared
if ! command -v cloudflared &>/dev/null; then
  echo "  ERROR: Could not install cloudflared. Install manually: brew install cloudflared"
  exit 1
fi

if [ "${1:-}" = "--background" ]; then
  stop_tunnel
  : > "$LOG_FILE"
  nohup cloudflared tunnel --url http://localhost:3000 >"$LOG_FILE" 2>&1 </dev/null &
  echo $! > "$PID_FILE"
  URL="$(wait_for_url || true)"
  if [ -n "${URL:-}" ]; then
    echo "  Public URL: $URL"
    exit 0
  fi
  echo "  Tunnel started, but URL not ready yet. Check: $LOG_FILE"
  exit 1
fi

echo ""
echo "  Voltaire — Anywhere Access"
echo "  Powered by Cloudflare Tunnel (free)"
echo ""
echo "  ============================================"
echo "  Your public URL will appear below."
echo "  Copy the https://... link and open it"
echo "  on any phone, anywhere in the world."
echo "  ============================================"
echo ""
cloudflared tunnel --url http://localhost:3000
