#!/usr/bin/env bash
# finalize2.sh <body.mp4> <cover.png> <out.mp4>
# [0.5s Cover-Freeze als Startbild] + Body + Follow-Outro, dann Titelmusik drunter.
# Alles 1080x1920 / 30 fps, encode CRF 15. Musik mit 1s Fade-out.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OUTRO="$HERE/outro-follow.mp4"
MUSIC="$HERE/../assets/title-music.m4a"
BODY="${1:?body mp4 required}"
COVER="${2:?cover png required}"
OUT="${3:?out mp4 required}"
for f in "$OUTRO" "$MUSIC" "$BODY" "$COVER"; do [ -f "$f" ] || { echo "fehlt: $f"; exit 1; }; done

TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
CAT="$TMP/cat.mp4"
ffmpeg -y -loglevel error -loop 1 -t 0.5 -i "$COVER" -i "$BODY" -i "$OUTRO" -filter_complex \
  "[0:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[c];\
   [1:v]fps=30,scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,format=yuv420p[b];\
   [2:v]fps=30,scale=1080:1920,setsar=1,format=yuv420p[o];\
   [c][b][o]concat=n=3:v=1:a=0[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 15 -pix_fmt yuv420p -movflags +faststart "$CAT"

DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CAT")"
FADE_ST="$(awk "BEGIN{d=$DUR-1; if(d<0)d=0; printf \"%.3f\", d}")"
# Musik loopen (-stream_loop), damit sie IMMER mindestens so lang wie das Video ist,
# dann exakt auf Videolänge trimmen + 1s Fade-out. So kürzt -shortest nie das Video.
ffmpeg -y -loglevel error -i "$CAT" -stream_loop -1 -i "$MUSIC" -filter_complex \
  "[1:a]atrim=0:${DUR},afade=t=out:st=${FADE_ST}:d=1,aformat=sample_rates=48000:channel_layouts=stereo[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
echo "OK -> $OUT ($DUR s)"
