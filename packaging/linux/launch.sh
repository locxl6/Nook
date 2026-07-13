#!/usr/bin/env bash

set -u

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OLLAMA_URL="http://127.0.0.1:11434/api/version"
OLLAMA_LOG="${XDG_STATE_HOME:-$HOME/.local/state}/nook/ollama.log"

ollama_is_ready() {
  curl -fsS --max-time 1 "$OLLAMA_URL" >/dev/null 2>&1
}

if ! ollama_is_ready; then
  if command -v ollama >/dev/null 2>&1; then
    mkdir -p "$(dirname "$OLLAMA_LOG")"
    nohup ollama serve >>"$OLLAMA_LOG" 2>&1 &

    for _ in {1..20}; do
      ollama_is_ready && break
      sleep 0.5
    done
  else
    echo "Ollama is not installed. Run install.sh again or install Ollama manually." >&2
  fi
fi

exec "$APP_DIR/Nook" "$@"
