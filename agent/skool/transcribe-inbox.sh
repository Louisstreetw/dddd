#!/usr/bin/env bash
set -euo pipefail

BASE=/home/claude/skool
INBOX="$BASE/inbox"
KNOWLEDGE="$BASE/knowledge"
PROCESSED="$BASE/processed"

WHISPER=/opt/trading/whisper-venv/bin/python3
TRANSCRIBE=/opt/trading/agent/transcribe.py
NOTIFY=/opt/trading/agent/notify.mjs

mkdir -p "$INBOX" "$KNOWLEDGE" "$PROCESSED"

found_any=0
shopt -s nullglob nocaseglob

for f in "$INBOX"/*.mp4 "$INBOX"/*.mov "$INBOX"/*.mkv "$INBOX"/*.webm "$INBOX"/*.m4a "$INBOX"/*.mp3 "$INBOX"/*.wav; do
  [ -f "$f" ] || continue
  found_any=1
  base=$(basename "$f")
  name="${base%.*}"
  safe=$(echo "$name" | tr ' ' '_' | tr -cd 'A-Za-z0-9._-')
  out="$KNOWLEDGE/$safe.md"

  echo "[transcribe] $base"

  # Extract mono 16kHz audio (best for Whisper)
  audio="/tmp/whisper-$$-$safe.wav"
  if ! ffmpeg -i "$f" -vn -ac 1 -ar 16000 "$audio" -y -loglevel error 2>&1; then
    echo "[error] ffmpeg failed on $base"
    continue
  fi

  {
    echo "# $name"
    echo
    echo "**Source:** \`$base\`"
    echo "**Transcrit le:** $(date '+%Y-%m-%d %H:%M:%S')"
    echo
    echo "## Transcription"
    echo
  } > "$out"

  if WHISPER_MODEL=small "$WHISPER" "$TRANSCRIBE" "$audio" fr >> "$out" 2>&1; then
    echo "[ok] $safe.md ($(wc -w < "$out") mots)"
    rm -f "$audio"
    mv "$f" "$PROCESSED/"
    # Telegram notification
    if [[ -f "$NOTIFY" && -f /opt/trading/agent/.env ]]; then
      (
        set -a
        # shellcheck disable=SC1091
        source /opt/trading/agent/.env
        set +a
        words=$(wc -w < "$out")
        node "$NOTIFY" "✅ Transcription terminée : $name ($words mots). Tu peux poser des questions au bot." 2>/dev/null || true
      ) || true
    fi
  else
    echo "[error] whisper failed on $base"
    rm -f "$audio"
  fi
done

if [[ $found_any -eq 0 ]]; then
  echo "[skool-inbox] rien à traiter"
fi
