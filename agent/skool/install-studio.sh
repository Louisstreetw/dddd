#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
log() { echo -e "${BLUE}[studio]${NC} $*"; }
ok()  { echo -e "${GREEN}[ok]${NC} $*"; }

log "Installation des deps : Xvfb (ecran virtuel), PulseAudio (son virtuel), ffmpeg"
apt-get update -qq
apt-get install -y -qq \
  xvfb \
  pulseaudio pulseaudio-utils \
  ffmpeg \
  dbus-x11

log "Preparation dossiers"
mkdir -p /home/claude/skool/recordings
mkdir -p /home/claude/skool/knowledge
mkdir -p /opt/trading/logs

chown -R claude:claude /home/claude/skool

ok "Studio installe"
echo
echo "Test:"
echo "  sudo -u claude bash /opt/trading/repo/agent/skool/record-one.sh <URL>"
