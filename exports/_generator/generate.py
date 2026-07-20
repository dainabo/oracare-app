#!/usr/bin/env python3
"""
Generates standalone, full-height HTML render pages for portfolio screenshots
of OraCare screens — reusing the real style.css, at natural content height,
with no phone-frame/viewport cropping. See exports/README.md for the full
pipeline (this script only produces the .html render files; run capture.sh
afterwards to turn them into PNGs).

Usage: python3 generate.py
Reads:  ../../index.html, ../../style.css (relative to this file)
Writes: ./_render/<slug>.html for every screen listed in SCREENS + ASSESSMENT_STEPS
"""
import re, os

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.normpath(os.path.join(HERE, "..", ".."))
RENDER_DIR = os.path.join(HERE, "_render")
os.makedirs(RENDER_DIR, exist_ok=True)

with open(os.path.join(PROJECT, "index.html"), "r", encoding="utf-8") as f:
    HTML = f.read()

STATUS_BAR = '''  <div class="status-bar{extra_class}" id="statusBar"{extra_style}>
    <span class="time">9:41</span>
    <div class="icons">
      <svg viewBox="0 0 16 12" fill="none"><rect x="0" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="4.5" y="2" width="3" height="10" rx="1" fill="currentColor" opacity="0.4"/><rect x="9" y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.3"/><rect x="13.5" y="0" width="2.5" height="12" rx="1" fill="currentColor" opacity="0.2"/></svg>
      <svg viewBox="0 0 16 12" fill="none"><path d="M8 2.5C10.5 2.5 12.7 3.5 14.2 5.2L15.5 3.7C13.6 1.4 10.9 0 8 0C5.1 0 2.4 1.4 0.5 3.7L1.8 5.2C3.3 3.5 5.5 2.5 8 2.5Z" fill="currentColor"/><path d="M8 5.5C9.7 5.5 11.2 6.2 12.3 7.3L13.6 5.8C12.1 4.3 10.1 3.5 8 3.5C5.9 3.5 3.9 4.3 2.4 5.8L3.7 7.3C4.8 6.2 6.3 5.5 8 5.5Z" fill="currentColor" opacity="0.7"/><circle cx="8" cy="10" r="2" fill="currentColor"/></svg>
      <svg viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" stroke-opacity="0.35"/><rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/><path d="M23 4.5V7.5C23.8 7.2 24.5 6.5 24.5 6C24.5 5.5 23.8 4.8 23 4.5Z" fill="currentColor" opacity="0.4"/></svg>
    </div>
  </div>'''

TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>export</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Manrope:wght@300;400;500;600;700&family=Outfit:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="file://{project}/style.css">
<style>
  html, body {{ margin: 0; padding: 0; background: var(--bg); display: block; }}
  .export-frame {{ position: relative; width: 375px; background: var(--bg); overflow-x: hidden; overflow-y: visible; }}
  /* Undo the live app's absolute/cropped phone-viewport positioning so each
     screen lays out at its natural full height instead of a fixed 812px
     scrollable box. min-height keeps short screens (splash, welcome) from
     collapsing to just their content's intrinsic height -- the live app's
     #app{{min-height:812px}} guarantees this everywhere; we replicate that
     floor here since #app itself isn't part of the export. */
  .screen {{ position: static !important; inset: auto !important; height: auto !important; min-height: 812px !important; overflow: visible !important; }}
  {extra_style}
</style>
</head>
<body>
<div class="export-frame">
{status_bar}
{screen_html}
</div>
<script>
/* Deterministic settle delay before measuring -- document.fonts.ready races
   with dump-dom's capture point in headless mode (observed flaky in
   testing), and requestAnimationFrame never fires in dump-dom's rendering
   path at all. A plain setTimeout, combined with --virtual-time-budget on
   the Chrome invocation (see capture.sh), is what's reliable. */
setTimeout(function() {{
  document.title = 'H:' + document.querySelector('.export-frame').scrollHeight;
}}, 400);
</script>
</body>
</html>
'''

DARK_SCREENS = {"screen-dashboard", "screen-premium", "screen-scan-instructions"}

# (screen_id, output_slug, extra_style)
SCREENS = [
    ("screen-splash", "splash", ""),
    ("screen-welcome", "welcome", ""),
    ("screen-life-stage", "life-stage", ""),
    ("screen-dashboard", "dashboard", ".score-ring-fill { animation: none !important; }"),
    ("screen-scan-instructions", "scan-instructions", ""),
    ("screen-premium", "premium", ""),
    ("screen-scan-capture", "capture", ""),
    ("screen-scan-analyzing", "analyzing", ""),
    ("screen-scan-results", "results", ""),
    ("screen-recommendations", "care-plan", ""),
    ("screen-profile", "profile", ""),
]

ASSESSMENT_STEPS = range(1, 8)  # astep-1 .. astep-7


def extract_balanced_div(text, open_tag_match_start, open_tag_match_end):
    depth = 1
    tag_re = re.compile(r'<div\b|</div>')
    for tm in tag_re.finditer(text, open_tag_match_end):
        depth += -1 if tm.group() == '</div>' else 1
        if depth == 0:
            return text[open_tag_match_start:tm.end()]
    raise ValueError("unbalanced div starting at %d" % open_tag_match_start)


def extract_screen(screen_id):
    m = re.search(r'<div class="screen[^"]*" id="' + re.escape(screen_id) + r'"[^>]*>', HTML)
    if not m:
        raise ValueError("screen not found: " + screen_id)
    return extract_balanced_div(HTML, m.start(), m.end())


def fix_asset_paths(block):
    return block.replace('src="assets/', 'src="file://{}/assets/'.format(PROJECT))


def apply_analyzing_completed_state(block):
    """The raw markup for screen-scan-analyzing is its 0%/unchecked initial
    state (the real 0->100% fill and checkmarks only happen via the
    startScan()/markDone() JS timers, which don't run in a static export).
    For the portfolio screenshot we want the "nearly done" look instead,
    matching exactly what markDone() produces at each checkpoint -- items
    1-3 get a checkmark, item 4 only has its hourglass cleared (the real
    JS never gives item 4 a checkmark either, since check-icon-4 has no
    <svg> for markDone()'s querySelector to find -- replicating that
    faithfully rather than "fixing" it, since this export must not change
    app behavior, just capture a later moment of it)."""
    block = block.replace('id="analyzePercent">0%<', 'id="analyzePercent">100%<')
    block = block.replace(
        '<circle class="analyze-ring-fill" id="analyzeRingFill" cx="90" cy="90" r="70"/>',
        '<circle class="analyze-ring-fill" id="analyzeRingFill" cx="90" cy="90" r="70" style="stroke-dashoffset: 0;"/>'
    )
    for i in (1, 2, 3):
        block = block.replace('class="check-item" id="check-{}"'.format(i), 'class="check-item done" id="check-{}"'.format(i))
    block = block.replace('style="display:none"', 'style="display:block"')
    block = block.replace('class="check-item" id="check-4"', 'class="check-item done" id="check-4"')
    block = block.replace('<span id="check-spinner-4">⏳</span>', '<span id="check-spinner-4"></span>')
    return block


def write_render(slug, screen_block, extra_style="", dark=False, is_splash=False):
    screen_block = fix_asset_paths(screen_block)
    extra_class = " status-bar--splash" if is_splash else (" status-bar--dark" if dark else "")
    extra_status_style = ' style="color:white"' if (dark or is_splash) else ""
    status_bar = STATUS_BAR.format(extra_class=extra_class, extra_style=extra_status_style)
    out = TEMPLATE.format(project=PROJECT, extra_style=extra_style, status_bar=status_bar, screen_html=screen_block)
    path = os.path.join(RENDER_DIR, slug + ".html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(out)
    print("wrote", path)


# ── Standalone screens ──
for screen_id, slug, extra_style in SCREENS:
    block = extract_screen(screen_id)
    block = re.sub(r'class="screen[^"]*"', 'class="screen active"', block, count=1)
    if slug == "analyzing":
        block = apply_analyzing_completed_state(block)
    write_render(slug, block, extra_style=extra_style,
                 dark=(screen_id in DARK_SCREENS), is_splash=(screen_id == "screen-splash"))

# ── Assessment: shared header (nav-row + progress bar) + one step per export ──
assessment_block = extract_screen("screen-assessment")
header_m = re.search(r'<div class="screen-header">', assessment_block)
header_block = extract_balanced_div(assessment_block, header_m.start(), header_m.end())

for n in ASSESSMENT_STEPS:
    step_m = re.search(r'<div class="assessment-step[^"]*" id="astep-' + str(n) + r'">', assessment_block)
    step_block = extract_balanced_div(assessment_block, step_m.start(), step_m.end())
    step_block = re.sub(r'class="assessment-step[^"]*"', 'class="assessment-step active"', step_block, count=1)

    pct = round(n / 7 * 100, 1)
    header_n = re.sub(r'width:\s*[\d.]+%', 'width: {}%'.format(pct), header_block, count=1)

    full = '<div class="screen active" id="screen-assessment">\n' + header_n + '\n' + step_block + '\n</div>'
    write_render("assessment-{}".format(n), full)

print("\ndone -- now run: bash capture.sh")
