#!/usr/bin/env bash
# finalize.sh <body.mp4> <out.mp4>
# Fügt den 3-Karten-Follow-Outro an einen Reel-Body an und legt die Titelmusik drunter.
# Normalisiert alles auf 1080x1920 / 30 fps, encode CRF 15. Musik mit 1s Fade-out.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUTRO="$HERE/outro-follow.mp4"
MUSIC="$HERE/../assets/title-music.m4a"
BODY="${1:?body mp4 required}"
OUT="${2:?out mp4 required}"
[ -f "$OUTRO" ] || { echo "outro fehlt: $OUTRO"; exit 1; }
[ -f "$MUSIC" ] || { echo "musik fehlt: $MUSIC"; exit 1; }

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
CAT="$TMP/cat.mp4"
# 1) Body + Outro konkatenieren (beide auf 1080x1920/30fps normalisieren)
ffmpeg -y -loglevel error -i "$BODY" -i "$OUTRO" -filter_complex \
  "[0:v]fps=30,scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[v0];\
   [1:v]fps=30,scale=1080:1920,setsar=1[v1];[v0][v1]concat=n=2:v=1:a=0[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 15 -pix_fmt yuv420p -movflags +faststart "$CAT"

# 2) Musik drunterlegen, auf Videolänge getrimmt + 1s Fade-out
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CAT")"
FADE_ST="$(awk "BEGIN{d=$DUR-1; if(d<0)d=0; printf \"%.3f\", d}")"
ffmpeg -y -loglevel error -i "$CAT" -i "$MUSIC" -filter_complex \
  "[1:a]atrim=0:${DUR},afade=t=out:st=${FADE_ST}:d=1,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
echo "OK -> $OUT ($DUR s)"
