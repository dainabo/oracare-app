# Portfolio screenshot exports

Full-height, uncropped PNGs of every OraCare screen, rendered directly from
the real `style.css` — not screenshots of the interactive prototype (which
is a fixed 375×812 "phone" viewport with internal scrolling, the opposite of
what a portfolio screenshot needs).

## How to regenerate

```
cd exports/_generator
python3 generate.py   # writes standalone render pages to _render/ (gitignored)
bash capture.sh        # captures each one to a PNG in exports/
```

Re-run this any time a screen's markup or styling changes. Requires Google
Chrome at the default macOS install path (edit the `CHROME` variable at the
top of `capture.sh` if yours lives elsewhere). No other dependencies —
no ImageMagick, no Node/Playwright/Puppeteer.

## What's exported

11 standalone screens (splash, welcome, life-stage, dashboard,
scan-instructions, premium, capture, analyzing, results, care-plan, profile)
plus all 7 assessment questions individually (`assessment-1.png` …
`assessment-7.png`, since they're one screen in the app but 7 distinct
question states).

Every PNG is 1290px wide (iPhone-15-Pro-equivalent), height varies per
screen based on actual content — tall screens like `care-plan.png` (7547px)
are NOT cropped; short screens floor at a minimum of one full "phone
screen" (2793px) so they don't look truncated. Background matches the
app's actual cream (`var(--bg)` / `#F8F5F4`), not white. Status bar is
frozen at 9:41 with full signal/wifi/battery (standard portfolio/App-Store
screenshot convention) instead of the live clock.

## How it works

`generate.py` extracts each screen's markup directly out of `index.html`
(same source of truth as the live app — nothing is hand-copied or
re-authored) and wraps it in a small standalone HTML page that loads the
real `style.css`. The key differences from the live app:

- The live app's screens are `position:absolute` inside a fixed-height
  `#app` container with `overflow-y:auto` (that's what makes it feel like
  a phone). The export overrides `.screen` to `position:static; height:auto`
  so it lays out at its natural full content height instead.
- `overflow-x:hidden` is kept on the wrapper (clips anything a hair wider
  than 375px, same as the live `#app`'s `overflow:hidden`) but
  `overflow-y` is `visible` (so nothing gets cut off vertically). Using
  `overflow:visible` on both axes was tried first and broke horizontally —
  content overflowed sideways and got centered by the page's inherited
  `display:flex;justify-content:center`, clipping the right edge and
  leaving a blank gap on the left.
- `min-height: 812px` on `.screen` — without it, short screens (splash
  especially, which relies on `min-height:100%` against `#app`'s fixed
  height in the live app) collapse to just their content's intrinsic
  height instead of filling a full screen.
- Image paths (`src="assets/..."`) get rewritten to absolute
  `file://.../assets/...` paths, since the render page doesn't live next
  to the real `assets/` folder.
- Capture is a two-pass process per screen: (1) headless Chrome loads the
  page and dumps the DOM after a deterministic 400ms settle
  delay (set via a page-side `setTimeout`, paired with Chrome's
  `--virtual-time-budget` flag so the delay is driven by a virtual clock,
  not real wall-clock time) that writes `document.querySelector('.export-
  frame').scrollHeight` into the page `<title>`, which we grep out of
  `--dump-dom` output; (2) headless Chrome re-loads the same page and
  `--screenshot`s it with `--window-size` set to exactly that measured
  height and `--force-device-scale-factor=3.44` (375×3.44≈1290, giving
  crisp @3x-equivalent output instead of blurry post-hoc upscaling).
  Waiting on `document.fonts.ready` (the "correct" way to wait for web
  fonts) was tried first and was flaky — it sometimes resolved before
  `--dump-dom` captured the title and sometimes after, non-deterministically,
  because dump-dom's exact capture point relative to font-load isn't
  guaranteed. The virtual-time-budget + setTimeout approach is
  reproducible because it's driven by Chrome's virtual clock rather than
  a real async race.

## Known limitation

The assessment screen's shared progress bar is recalculated per exported
question (`n/7 * 100%`) since the source HTML only has step 1's value
baked in — if the number of assessment questions ever changes, update the
`ASSESSMENT_STEPS` range and the `ASSESSMENT_STEPS`-derived percentage
math in `generate.py` accordingly.
