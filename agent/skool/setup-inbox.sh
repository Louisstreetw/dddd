#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
log() { echo -e "${BLUE}[skool-inbox]${NC} $*"; }
ok()  { echo -e "${GREEN}[ok]${NC} $*"; }

BASE=/home/claude/skool

log "Installing ffmpeg (extraction audio depuis videos)"
apt-get update -qq
apt-get install -y -qq ffmpeg

log "Création de la structure"
mkdir -p "$BASE/inbox" "$BASE/knowledge" "$BASE/processed"

log "Permissions"
chown -R claude:claude "$BASE"
chmod 755 "$BASE"
chmod 1777 "$BASE/inbox"   # tous peuvent ecrire mais pas supprimer d'autres fichiers

log "Copie du script de transcription"
cp /opt/trading/repo/agent/skool/transcribe-inbox.sh "$BASE/"
chmod +x "$BASE/transcribe-inbox.sh"
chown claude:claude "$BASE/transcribe-inbox.sh"

ok "Inbox prete a recevoir des videos"
echo
echo "Upload depuis ton PC :"
echo "  scp video.mp4 root@SERVEUR:/home/claude/skool/inbox/"
echo
echo "Transcription manuelle (auto sinon via systemd) :"
echo "  sudo -u claude bash /home/claude/skool/transcribe-inbox.sh"
