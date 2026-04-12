#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1

echo "Building Voltaire desktop app (.dmg)..."
npm install
npm run dist:mac

echo ""
echo "Build complete. Check:"
echo "$DIR/dist"
