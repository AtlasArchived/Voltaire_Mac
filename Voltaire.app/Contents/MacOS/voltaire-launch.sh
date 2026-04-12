#!/bin/bash
# Invoked by the real Mach-O binary voltaire-launcher (see tools/mac_app_stub.c).
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

LOG_DIR="${HOME}/Library/Logs"
LOG="${LOG_DIR}/Voltaire-launcher.log"
mkdir -p "$LOG_DIR"

log() { echo "[$(date '+%H:%M:%S')] $*" >>"$LOG"; }

{
  log "======== launch pid=$$ ========"
  log "arg0=$0"
  HERE="$(cd "$(dirname "$0")" && pwd)" || { log "dirname failed"; exit 1; }
  log "HERE=$HERE"

  /usr/bin/osascript -e 'display notification "Starting Voltaire…" with title "Voltaire"' 2>/dev/null || log "osascript notification failed (ok on some setups)"

  ROOT=""
  d="$HERE"
  while [ "$d" != "/" ]; do
    if [ -f "$d/start.sh" ] && [ -d "$d/backend" ] && [ -d "$d/frontend" ]; then
      ROOT="$d"
      break
    fi
    d="$(dirname "$d")"
  done
  log "ROOT=$ROOT"

  if [ -z "$ROOT" ]; then
    log "ERROR: project not found walking up from $HERE"
    /usr/bin/osascript <<'APPLESCRIPT'
display dialog "Voltaire could not find its project folder.

Put Voltaire.app INSIDE the voltaire_mac folder (next to start.sh, backend, and frontend).

If the app is alone on the Desktop, drag it back into that folder.

Tip: open ~/Library/Logs/Voltaire-launcher.log for details." buttons {"OK"} default button 1 with title "Voltaire"
APPLESCRIPT
    exit 1
  fi

  if [ ! -r "$ROOT/start.sh" ]; then
    log "ERROR: cannot read $ROOT/start.sh"
    /usr/bin/osascript -e 'display dialog "Cannot read start.sh in the project folder. Check file permissions." with title "Voltaire"'
    exit 1
  fi
  chmod +x "$ROOT/start.sh" "$ROOT/stop_voltaire.sh" 2>/dev/null || true

  log "exec start.sh --headless"
  exec /bin/bash "$ROOT/start.sh" --headless
} >>"$LOG" 2>&1

/usr/bin/osascript -e 'display dialog "Voltaire launcher could not start the script. See ~/Library/Logs/Voltaire-launcher.log" with title "Voltaire"'
exit 1
