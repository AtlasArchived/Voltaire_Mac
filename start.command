#!/bin/bash
# Double-clickable launcher for macOS Finder.
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1

./start.sh
