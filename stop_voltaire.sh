#!/bin/bash
# Stop background Voltaire servers (same as freeing ports 8000 + 3000).
DIR="$(cd "$(dirname "$0")" && pwd)"
cleanup_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:$port 2>/dev/null | tr '\n' ' ')"
  if [ -n "$pids" ]; then
    echo "Stopping port $port (PIDs: $pids)"
    kill $pids 2>/dev/null || true
    sleep 1
    pids="$(lsof -ti tcp:$port 2>/dev/null | tr '\n' ' ')"
    [ -n "$pids" ] && kill -9 $pids 2>/dev/null || true
  else
    echo "Nothing listening on port $port"
  fi
}
cleanup_port 8000
cleanup_port 3000
echo "Voltaire stopped."
