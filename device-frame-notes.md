# device-frame.html — the top/bottom margin issue

`index.html`'s `<body>` used to have `padding: 24px 0 48px` (in `style.css`,
`html, body { ... }` rule) — meant for standalone viewing so `#app` doesn't
sit flush against the browser's edges. Embedded in `device-frame.html`'s
iframe, that padding showed up as an unwanted gray margin around `#app`
inside the bezel.

**The fix: that padding was just removed from `style.css` directly.**
`#app` now renders flush at the top-left of `<body>`, which is exactly
what both standalone viewing (still looks fine — `#app` is a self-contained
rounded card) and the device-frame embed need.

## What was tried first (didn't work / wasn't needed)

Several iframe-side workarounds were built before landing on the direct
fix above — noting them so they aren't reinvented:

- **Negative-offset cropping** (`iframe { top: -Npx }` inside an
  `overflow: hidden` wrapper sized to just `#app`): fragile, the "correct"
  calculated offset (24px, matching the padding) consistently left a
  visible sliver in real browsers that only a larger, empirically-tuned
  offset (~32px) removed — never fully explained why.
- **Same-origin script injection** (`iframe.contentDocument` +
  `doc.head.appendChild(a <style> tag setting padding:0 !important)`,
  both as a single `load`-event handler and later as a `setInterval`
  poll with self-verification via computed style): worked reliably in
  headless/automated testing, but did not reliably apply in real
  browsers (confirmed via DevTools — computed `padding-top` stayed
  `24px` regardless). Root cause not conclusively identified; possibly
  something specific to this exact cross-frame injection pattern that
  doesn't fully match automated-testing conditions.
- **Showing the iframe at its natural full height** (884px, including
  the padding) and sizing the bezel around that instead of cropping:
  works, but reintroduces a visible margin — abandoned once the source
  CSS edit made it unnecessary.

If a similar "content doesn't fill its container" problem comes up
elsewhere: **check whether the gap can just be removed at the source
first**, before reaching for iframe-side cropping/injection tricks — that
was the fast, correct fix here and should have been the first thing tried,
not the last.
