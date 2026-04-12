#!/bin/bash
# Voltaire — Anywhere Access via Cloudflare Tunnel
# Run in a separate Terminal while Voltaire is running
# Your URL will look like: https://xxx-xxx.trycloudflare.com

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo ""
echo "  Voltaire — Anywhere Access"
echo "  Powered by Cloudflare Tunnel (free)"
echo ""

# ── Install cloudflared ──────────────────────────────────────
if ! command -v cloudflared &>/dev/null; then
  echo "  Installing cloudflared..."
  if command -v brew &>/dev/null; then
    brew install cloudflared
  else
    # Direct download for Apple Silicon or Intel
    ARCH=$(uname -m)
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
fi

if ! command -v cloudflared &>/dev/null; then
  echo "  ERROR: Could not install cloudflared."
  echo "  Install manually: brew install cloudflared"
  exit 1
fi

echo "  cloudflared ready"
echo ""
echo "  ============================================"
echo "  Your public URL will appear below."
echo "  Copy the https://... link and open it"
echo "  on any phone, anywhere in the world."
echo "  ============================================"
echo ""

cloudflared tunnel --url http://localhost:3000
