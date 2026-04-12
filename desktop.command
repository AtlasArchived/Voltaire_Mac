#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR" || exit 1

if [ ! -d "$DIR/node_modules/electron" ]; then
  npm install
fi

npm run desktop
