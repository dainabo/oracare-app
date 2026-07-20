#!/usr/bin/env bash
# Captures every rendered HTML page in _render/ to a full-height PNG in exports/.
# Run generate.py first. See exports/README.md for how this works and why.
set -e

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT="$(cd "$HERE/../.." && pwd)"
RENDER_DIR="$HERE/_render"
OUT_DIR="$PROJECT/exports"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -x "$CHROME" ]; then
  echo "Chrome not found at: $CHROME"
  echo "Edit the CHROME path at the top of this script if it's installed elsewhere."
  exit 1
fi

for html_file in "$RENDER_DIR"/*.html; do
  slug="$(basename "$html_file" .html)"

  # Pass 1: measure the true rendered height (width fixed at 375 CSS px --
  # the design width -- --virtual-time-budget=1500 deterministically advances
  # Chrome's virtual clock so the page's 400ms settle-timer fires before dump).
  height=$("$CHROME" --headless=new --disable-gpu --virtual-time-budget=1500 \
    --window-size=375,600 --dump-dom "file://$html_file" 2>/dev/null \
    | grep -o '<title>H:[0-9]*</title>' | grep -o '[0-9]*')

  if [ -z "$height" ]; then
    echo "FAILED to measure $slug -- skipping"
    continue
  fi

  # Pass 2: capture at that exact height, --force-device-scale-factor=3.44
  # renders at ~3x pixel density (375*3.44=1290px wide, matching the
  # iPhone-15-Pro-equivalent 1290x2796 target resolution) without blurry
  # post-hoc upscaling.
  "$CHROME" --headless=new --disable-gpu --virtual-time-budget=1500 \
    --force-device-scale-factor=3.44 --window-size=375,"$height" \
    --screenshot="$OUT_DIR/$slug.png" "file://$html_file" 2>/dev/null

  dims=$(sips -g pixelWidth -g pixelHeight "$OUT_DIR/$slug.png" 2>/dev/null | tail -2 | tr '\n' ' ')
  echo "$slug -> ${height}px (CSS) -> $dims"
done
