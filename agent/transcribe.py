#!/usr/bin/env python3
"""Transcribe an audio file (OGG/WAV/MP3) to text using faster-whisper."""
import sys
import os

if len(sys.argv) < 2:
    print("Usage: transcribe.py <audio_file> [language]", file=sys.stderr)
    sys.exit(1)

audio_path = sys.argv[1]
language = sys.argv[2] if len(sys.argv) > 2 else "fr"

if not os.path.exists(audio_path):
    print(f"File not found: {audio_path}", file=sys.stderr)
    sys.exit(1)

from faster_whisper import WhisperModel

model_size = os.environ.get("WHISPER_MODEL", "small")
model = WhisperModel(model_size, device="cpu", compute_type="int8")

segments, _ = model.transcribe(audio_path, language=language, vad_filter=True)
text_parts = []
for segment in segments:
    text_parts.append(segment.text.strip())

print(" ".join(text_parts).strip())
