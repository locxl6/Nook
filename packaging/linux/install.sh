#!/usr/bin/env bash

set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/nook"
APPLICATIONS_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
ICON_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor/512x512/apps"

echo "Installing Nook to $INSTALL_DIR"
mkdir -p "$INSTALL_DIR" "$APPLICATIONS_DIR" "$ICON_DIR"

if [[ "$SOURCE_DIR" != "$INSTALL_DIR" ]]; then
  cp -a "$SOURCE_DIR/." "$INSTALL_DIR/"
fi

chmod +x "$INSTALL_DIR/Nook" "$INSTALL_DIR/resources/backend/nook-backend"
cp "$INSTALL_DIR/nook.png" "$ICON_DIR/nook.png"

cat > "$APPLICATIONS_DIR/nook.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Nook
Comment=Local AI Chat Application
Exec="$INSTALL_DIR/Nook"
Path=$INSTALL_DIR
Icon=nook
Terminal=false
Categories=Utility;
Keywords=AI;Chat;Ollama;LLM;
EOF

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$APPLICATIONS_DIR" >/dev/null 2>&1 || true
fi

if command -v ollama >/dev/null 2>&1; then
  echo "Ollama is already installed."
else
  printf "Ollama is not installed. Install it now? [Y/n] "
  read -r answer
  if [[ -z "$answer" || "$answer" =~ ^[Yy]$ ]]; then
    if ! command -v curl >/dev/null 2>&1; then
      echo "curl is required to install Ollama." >&2
      exit 1
    fi
    curl -fsSL https://ollama.com/install.sh | sh
  else
    echo "Install Ollama later from https://ollama.com/download/linux"
  fi
fi

echo "Nook is installed. Launch it from the application menu or run:"
echo "  $INSTALL_DIR/Nook"
