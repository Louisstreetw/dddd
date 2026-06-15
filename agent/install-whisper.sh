#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
log() { echo -e "${BLUE}[whisper]${NC} $*"; }
ok()  { echo -e "${GREEN}[ok]${NC} $*"; }

VENV=/opt/trading/whisper-venv

log "Installing system deps (python3-venv, ffmpeg)"
apt-get update -qq
apt-get install -y -qq python3-venv ffmpeg

log "Creating Python venv at $VENV"
if [[ ! -d "$VENV" ]]; then
  python3 -m venv "$VENV"
fi

log "Installing faster-whisper"
"$VENV/bin/pip" install --quiet --upgrade pip
"$VENV/bin/pip" install --quiet faster-whisper

log "Pre-downloading 'small' Whisper model (may take 1-2 min, ~500MB)"
"$VENV/bin/python3" - <<'PY'
from faster_whisper import WhisperModel
print("Downloading model 'small'...")
WhisperModel("small", device="cpu", compute_type="int8")
print("Model ready.")
PY

log "Setting ownership for claude user (if exists)"
if id -u claude >/dev/null 2>&1; then
  chown -R claude:claude "$VENV"
fi

ok "Whisper installed at $VENV"
ok "Test:  $VENV/bin/python3 /opt/trading/agent/transcribe.py <audio.ogg>"
