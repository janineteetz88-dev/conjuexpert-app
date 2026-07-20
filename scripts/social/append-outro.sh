#!/usr/bin/env bash
# Hängt den Standard-Outro (10s App-Intro / "missing piece") an ein Reel.
# Nutzung: ./append-outro.sh <reel.mp4> [out.mp4]
# Normalisiert auf 1080x1920 / 30 fps und konkateniert per ffmpeg concat-Filter.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
OUTRO="$DIR/feature-spot/outro.mp4"
REEL="${1:?reel mp4 required}"
OUT="${2:-${REEL%.mp4}-final.mp4}"
[ -f "$OUTRO" ] || { echo "Outro fehlt: $OUTRO"; exit 1; }
ffmpeg -y -loglevel error -i "$REEL" -i "$OUTRO" -filter_complex \
  "[0:v]fps=30,scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[v0];\
   [1:v]fps=30,scale=1080:1920,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart "$OUT"
echo "OK -> $OUT"
