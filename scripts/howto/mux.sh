#!/usr/bin/env bash
# Mux picture + VO into a reviewable how-to MP4.
# Pads video with a frozen last frame when VO is longer.
# Usage: bash scripts/howto/mux.sh <video> <audio> <out>
set -euo pipefail

VIDEO="${1:?video path}"
AUDIO="${2:?audio path}"
OUT="${3:?output path}"

if [[ ! -f "$VIDEO" ]]; then
  echo "missing video: $VIDEO" >&2
  exit 1
fi
if [[ ! -f "$AUDIO" ]]; then
  echo "missing audio: $AUDIO" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"

V_DUR="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$VIDEO")"
A_DUR="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$AUDIO")"
PAD="$(python3 -c "print(max(0, round(float('$A_DUR') - float('$V_DUR'), 3)))")"

echo "video=${V_DUR}s audio=${A_DUR}s pad=${PAD}s"

ffmpeg -y \
  -i "$VIDEO" \
  -i "$AUDIO" \
  -filter_complex "[0:v]tpad=stop_mode=clone:stop_duration=${PAD}[v]" \
  -map "[v]" -map 1:a \
  -c:v libx264 -pix_fmt yuv420p -preset veryfast -crf 20 \
  -c:a aac -b:a 192k \
  -t "$A_DUR" \
  "$OUT"

echo "wrote $OUT"
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT"
