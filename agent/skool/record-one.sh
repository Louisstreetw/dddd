#!/usr/bin/env bash
# Record audio of a single Skool lesson page.
# Usage: record-one.sh <URL> [name]

set -uo pipefail

URL="${1:?usage: record-one.sh <URL> [name]}"
NAME="${2:-lesson-$(date +%s)}"
SAFE_NAME=$(echo "$NAME" | tr ' ' '_' | tr -cd 'A-Za-z0-9._-')

REC_DIR=/home/claude/skool/recordings
LOG=/opt/trading/logs/studio.log
AUDIO="$REC_DIR/$SAFE_NAME.wav"

mkdir -p "$REC_DIR"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*" | tee -a "$LOG"; }

# Clean any leftover Xvfb/pulseaudio
pkill -u "$(whoami)" Xvfb 2>/dev/null || true
pkill -u "$(whoami)" pulseaudio 2>/dev/null || true
sleep 1

# Start Xvfb on display :99
log "Starting Xvfb :99"
Xvfb :99 -screen 0 1280x720x24 -nolisten tcp -nolisten unix &
XVFB_PID=$!
sleep 2
export DISPLAY=:99

# Start PulseAudio with a null sink "recorder"
log "Starting PulseAudio"
export XDG_RUNTIME_DIR="/tmp/runtime-$(whoami)"
mkdir -p "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"

pulseaudio --start --exit-idle-time=-1 --log-target=stderr 2>>"$LOG" || true
sleep 2

# Create a null sink we'll record from
pactl load-module module-null-sink sink_name=recorder sink_properties=device.description=recorder 2>>"$LOG" || true
pactl set-default-sink recorder 2>>"$LOG" || true

cleanup() {
  log "Cleanup..."
  kill "$FFMPEG_PID" 2>/dev/null || true
  kill "$PW_PID" 2>/dev/null || true
  sleep 1
  kill -9 "$FFMPEG_PID" 2>/dev/null || true
  kill -9 "$PW_PID" 2>/dev/null || true
  pkill -u "$(whoami)" -f "Xvfb :99" 2>/dev/null || true
  pulseaudio --kill 2>/dev/null || true
}
trap cleanup EXIT

# Launch Playwright that opens the URL and plays the video.
# It writes the detected duration to /tmp/duration.txt then keeps the page open.
log "Launching Playwright..."
DURATION_FILE=/tmp/duration-$$.txt
URL="$URL" DURATION_FILE="$DURATION_FILE" node /opt/trading/agent/skool/record-one.mjs >>"$LOG" 2>&1 &
PW_PID=$!

# Wait for duration to be detected (up to 60s)
WAIT_SECS=0
DURATION=""
while [[ $WAIT_SECS -lt 60 ]]; do
  if [[ -f "$DURATION_FILE" ]]; then
    DURATION=$(cat "$DURATION_FILE")
    break
  fi
  sleep 1
  WAIT_SECS=$((WAIT_SECS + 1))
done

if [[ -z "$DURATION" ]]; then
  log "ERREUR: pas de duree detectee dans les 60s"
  log "Voir $LOG"
  exit 1
fi

# Add 30s buffer
REC_SECS=$(( ${DURATION%.*} + 30 ))
log "Duree video detectee: ${DURATION}s — enregistrement pour ${REC_SECS}s"

# Start ffmpeg recording from the null sink monitor
log "Starting ffmpeg → $AUDIO"
ffmpeg -loglevel error \
  -f pulse -i recorder.monitor \
  -ac 1 -ar 16000 \
  -t "$REC_SECS" \
  -y "$AUDIO" &
FFMPEG_PID=$!

# Wait for ffmpeg to finish
wait $FFMPEG_PID
log "Recording terminee: $AUDIO ($(du -h "$AUDIO" | cut -f1))"

# Kill Playwright now
kill $PW_PID 2>/dev/null || true

# Transcribe
log "Transcription Whisper..."
TRANSCRIPT="/home/claude/skool/knowledge/$SAFE_NAME.md"
{
  echo "# $NAME"
  echo
  echo "**URL:** $URL"
  echo "**Duree:** ${DURATION}s"
  echo "**Transcrit le:** $(ts)"
  echo
  echo "## Transcription"
  echo
} > "$TRANSCRIPT"

WHISPER_MODEL=small /opt/trading/whisper-venv/bin/python3 \
  /opt/trading/agent/transcribe.py "$AUDIO" fr >> "$TRANSCRIPT" 2>>"$LOG"

WORDS=$(wc -w < "$TRANSCRIPT")
log "OK: $TRANSCRIPT ($WORDS mots)"

# Telegram notification
if [[ -f /opt/trading/agent/notify.mjs && -f /opt/trading/agent/.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source /opt/trading/agent/.env
  set +a
  node /opt/trading/agent/notify.mjs "✅ Transcription terminée : $NAME ($WORDS mots)" 2>>"$LOG" || true
fi

echo
echo "Audio :       $AUDIO"
echo "Transcript :  $TRANSCRIPT"
