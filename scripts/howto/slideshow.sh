#!/usr/bin/env bash
# Build a timed slideshow from stills (pilot path when live capture is short).
# Reads docs/howto-pilot timing; inputs are absolute paths via env or defaults.
set -euo pipefail

SLIDES_DIR="${HOWTO_SLIDES_DIR:-/tmp/howto-slides}"
OUT="${1:-/tmp/howto-slides/picture.mp4}"

cd "$SLIDES_DIR"

ffmpeg -y -f concat -safe 0 -i list.txt \
  -vf "scale=1920:1200:force_original_aspect_ratio=decrease,pad=1920:1200:(ow-iw)/2:(oh-ih)/2,format=yuv420p,fps=30" \
  -c:v libx264 -preset veryfast -crf 20 \
  "$OUT"

echo "wrote $OUT"
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT"
