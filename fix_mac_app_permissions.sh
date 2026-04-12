#!/bin/bash
# Run once in Terminal if double-click does nothing (Gatekeeper / permissions).
# Usage: cd …/voltaire_mac   &&   ./fix_mac_app_permissions.sh

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1

echo "Fixing Voltaire.app + StopVoltaire.app…"

chmod +x start.sh stop_voltaire.sh 2>/dev/null
chmod +x Voltaire.app/Contents/MacOS/voltaire-launch.sh StopVoltaire.app/Contents/MacOS/stop-launch.sh 2>/dev/null

if command -v clang &>/dev/null && [ -f "$DIR/tools/mac_app_stub.c" ]; then
  echo "Building Mach-O launch stubs (required on many macOS versions)…"
  clang -O2 -Wall -Wextra -DVOLTAIRE=1 -arch arm64 -arch x86_64 \
    -o Voltaire.app/Contents/MacOS/voltaire-launcher "$DIR/tools/mac_app_stub.c" || exit 1
  clang -O2 -Wall -Wextra -DVOLTAIRE=0 -arch arm64 -arch x86_64 \
    -o StopVoltaire.app/Contents/MacOS/stop-voltaire "$DIR/tools/mac_app_stub.c" || exit 1
  chmod +x Voltaire.app/Contents/MacOS/voltaire-launcher StopVoltaire.app/Contents/MacOS/stop-voltaire
  codesign --force --deep --sign - Voltaire.app StopVoltaire.app 2>/dev/null || true
else
  echo "WARN: clang or tools/mac_app_stub.c missing — install Xcode Command Line Tools: xcode-select --install"
fi

xattr -cr Voltaire.app StopVoltaire.app 2>/dev/null || xattr -c Voltaire.app 2>/dev/null

echo "Done. Try: double-click Voltaire.app"
echo "If macOS still blocks it: right-click Voltaire.app → Open → Open."
echo "Log file: ~/Library/Logs/Voltaire-launcher.log"
