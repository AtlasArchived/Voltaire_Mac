#!/bin/bash
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT=""
d="$HERE"
while [ "$d" != "/" ]; do
  if [ -f "$d/stop_voltaire.sh" ] && [ -d "$d/backend" ]; then
    ROOT="$d"
    break
  fi
  d="$(dirname "$d")"
done

if [ -z "$ROOT" ]; then
  /usr/bin/osascript -e 'display dialog "Could not find stop_voltaire.sh. Keep StopVoltaire.app inside your voltaire_mac folder." buttons {"OK"} default button 1 with title "Voltaire"'
  exit 1
fi

/bin/bash "$ROOT/stop_voltaire.sh"
/usr/bin/osascript -e 'display notification "Ports 8000 and 3000 cleared." with title "Voltaire"' 2>/dev/null || true
