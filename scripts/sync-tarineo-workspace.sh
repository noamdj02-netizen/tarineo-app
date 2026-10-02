#!/usr/bin/env bash
# Synchronise le dépôt canonique (iCloud / DesktopOrganizer) vers ~/Projects/Tarineo pour le dev local.
set -euo pipefail

SOURCE="${TARINEO_SOURCE:-$HOME/Documents/Logo/DesktopOrganizer/Folder 1/Tarineo}"
TARGET="${TARINEO_TARGET:-$HOME/Projects/Tarineo}"

if [[ ! -d "$SOURCE" ]]; then
  echo "Source introuvable: $SOURCE" >&2
  exit 1
fi

mkdir -p "$TARGET"

rsync -a --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude '.env*' \
  --exclude '.cursor' \
  "$SOURCE/" "$TARGET/"

echo "Sync terminé: $SOURCE → $TARGET"
echo "Relancez le serveur dev depuis $TARGET si besoin."
