# prototype-interactions.html — reusable Figma-style click-highlight overlay

What this is: a standalone HTML file that iframes a prototype (optionally
through an intermediate device-frame wrapper) and draws a temporary blue
outline around whatever's interactive, on click — like Figma's "show
hotspots" prototype behavior. Nothing in the wrapped prototype is touched;
it's a pure outside observer.

This file documents the mechanism itself so it can be rebuilt in a new
project without re-deriving the gotchas below from scratch. See
`prototype-interactions.html` in this repo for the actual working
implementation this was extracted from.

## Architecture

```
prototype-interactions.html
  └─ iframe → device-frame.html   (optional middle layer — a phone bezel, a
       └─ iframe → index.html      browser chrome mockup, or nothing at all)
```

Zero, one, or two iframe layers all work the same way — `mapRectUp()`
(below) is called once per layer between the clicked element and the
outermost document. If there's no device-frame layer, call it once instead
of twice.

**Hard requirement: this only works served over `http(s)`, never opened as
a local `file://` path.** Reaching into a nested iframe's `contentDocument`
to attach listeners and measure element positions is blocked by the browser
across `file://` origins, even for files sitting right next to each other.
Deploy it (Vercel, any static host) or run a local server
(`python3 -m http.server`) — there's no way around this, and it fails
silently (no error, the overlay just never attaches), so this is the first
thing to check if "nothing happens."

## The reusable core

```html
<style>
  .click-highlight {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    box-sizing: border-box;
    border: 1.5px solid rgba(59, 130, 246, 0.9);
    background: rgba(59, 130, 246, 0.15);
    opacity: 0;
    transition: opacity 100ms ease;
  }
  .click-highlight.visible { opacity: 1; }
</style>

<script>
  let activeHighlights = [];
  let holdTimer = null;
  let fadeOutTimer = null;
  const FADE_IN_MS = 100;
  const HOLD_MS = 350;
  const FADE_OUT_MS = 650;

  // Waits for an iframe's REAL page, not the transient "about:blank"
  // placeholder every iframe briefly holds before it navigates to its
  // actual src -- that placeholder is also (trivially) readyState
  // "complete", with an empty body, and catching it instead of the real
  // page is a near-guaranteed bug if you don't guard against it.
  function onFrameReady(frameEl, cb) {
    let doc;
    try {
      doc = frameEl.contentDocument;
    } catch (e) {
      console.warn('Cannot reach ' + frameEl.src + ' -- serve over http(s), not as a local file.', e);
      return;
    }
    if (doc.readyState === 'complete' && doc.body && doc.body.childElementCount > 0) {
      cb(doc);
    } else {
      // Don't rely on 'load' alone either: a nested iframe can finish
      // loading before you get around to attaching a listener to it
      // (nested iframes start loading as soon as their parent markup is
      // parsed, not gated by any ancestor's own load event), so the
      // readyState check above has to come first.
      frameEl.addEventListener('load', () => cb(frameEl.contentDocument));
    }
  }

  // Maps a rect from an iframe's own document up into its parent
  // document's coordinate space. Call once per iframe layer between the
  // element and the outermost document. Works with any CSS scale
  // transform on ancestors of the iframe (a responsive "scale to fit"
  // wrapper, for instance) because it compares the iframe's as-rendered
  // size (getBoundingClientRect, post-transform) against its pre-transform
  // layout size (offsetWidth/Height) to derive the effective scale.
  function mapRectUp(rect, iframeEl) {
    const frameRect = iframeEl.getBoundingClientRect();
    const scaleX = frameRect.width / iframeEl.offsetWidth;
    const scaleY = frameRect.height / iframeEl.offsetHeight;
    return {
      left: frameRect.left + rect.left * scaleX,
      top: frameRect.top + rect.top * scaleY,
      width: rect.width * scaleX,
      height: rect.height * scaleY,
      scale: scaleX
    };
  }

  // An element can be a real DOM match and still be wrong to highlight:
  //  - hidden by display:none on itself or an ancestor (a step/tab/panel
  //    that isn't the currently visible one, but still lives in the DOM)
  //  - scrolled out of the currently visible viewport
  // offsetParent is null for the display:none case. The highlight box
  // itself isn't clipped by the prototype's own scroll container (it
  // lives in the outer document), so a partially-visible element needs
  // to be excluded entirely, not just "any overlap counts."
  function isOnScreen(el, win) {
    if (el.offsetParent === null) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    return r.top >= 0 && r.bottom <= win.innerHeight && r.left >= 0 && r.right <= win.innerWidth;
  }

  function clearHighlights() {
    if (holdTimer) clearTimeout(holdTimer);
    if (fadeOutTimer) clearTimeout(fadeOutTimer);
    holdTimer = fadeOutTimer = null;
    activeHighlights.forEach((el) => el.remove());
    activeHighlights = [];
  }

  function showHighlights(elements, ...iframeLayers) {
    clearHighlights();

    elements.forEach((el) => {
      let mapped = el.getBoundingClientRect();
      iframeLayers.forEach((frame) => { mapped = mapRectUp(mapped, frame); });

      // Always a plain rectangle, regardless of the element's own shape.
      // Matching the highlight's corners to a rounded/circular element
      // (icon buttons, pills, chips) makes it nearly invisible -- it just
      // blends into the button underneath. This is also how Figma's own
      // hotspot highlight actually behaves, not an approximation of it.
      const box = document.createElement('div');
      box.className = 'click-highlight';
      box.style.left = mapped.left + 'px';
      box.style.top = mapped.top + 'px';
      box.style.width = mapped.width + 'px';
      box.style.height = mapped.height + 'px';
      document.body.appendChild(box);
      activeHighlights.push(box);
    });

    if (activeHighlights.length === 0) return;

    void document.body.offsetWidth; // force reflow so opacity re-triggers the transition
    activeHighlights.forEach((el) => {
      el.style.transition = 'opacity ' + FADE_IN_MS + 'ms ease';
      el.classList.add('visible');
    });

    // Fade in fast, hold, then a slow eased fade-out -- a real navigation
    // event cuts this short via the MutationObserver below well before it
    // finishes naturally, so this is free to prioritize being clearly
    // perceivable over finishing quickly. A too-fast highlight isn't just
    // annoying, it's an accessibility problem -- some people genuinely
    // cannot register a ~200ms flash.
    holdTimer = setTimeout(() => {
      activeHighlights.forEach((el) => {
        el.style.transition = 'opacity ' + FADE_OUT_MS + 'ms ease-out';
        el.classList.remove('visible');
      });
      fadeOutTimer = setTimeout(clearHighlights, FADE_OUT_MS);
    }, HOLD_MS);
  }
</script>
```

## Wiring it up (the part that's project-specific)

```js
onFrameReady(outerFrame, (middleDoc) => {
  const innerFrame = middleDoc.querySelector('iframe'); // skip if no middle layer
  onFrameReady(innerFrame, (prototypeDoc) => {
    attachHighlighting(prototypeDoc, innerFrame, outerFrame);
  });
});

function attachHighlighting(prototypeDoc, ...iframeLayers) {
  prototypeDoc.addEventListener('click', (event) => {
    // Direct click on something interactive: let it do its own thing,
    // don't also light up every OTHER interactive element -- that reads
    // as "all of these just got activated," not "you picked one."
    if (event.target.closest(INTERACTIVE_SELECTOR)) return;

    const scope = prototypeDoc.querySelector(CURRENT_VIEW_SELECTOR);
    if (!scope) return;
    const candidates = scope.querySelectorAll(INTERACTIVE_SELECTOR);
    const targets = Array.prototype.filter.call(candidates, (el) =>
      isOnScreen(el, prototypeDoc.defaultView)
    );
    showHighlights(targets, ...iframeLayers);
  }, true);

  watchForViewChange(prototypeDoc);
}

function watchForViewChange(prototypeDoc) {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.target.classList && VIEW_CHANGE_CLASSES.some((c) => m.target.classList.contains(c))) {
        clearHighlights();
        return;
      }
    }
  });
  observer.observe(prototypeDoc.body, { attributes: true, attributeFilter: ['class'], subtree: true });
}
```

## Checklist for a new project

Three things are genuinely project-specific and need figuring out fresh
each time -- everything else above is copy-paste:

1. **`INTERACTIVE_SELECTOR`** — what CSS selector finds "everything
   clickable" in this prototype? OraCare's was `'[onclick], .filter-pill'`
   (inline `onclick` handlers, plus one component using
   `addEventListener` instead). A different codebase might use
   `role="button"`, a component class like `.btn, .card--clickable`, or
   `[data-action]` if it's more deliberately marked up. Whatever it is,
   confirm it's precise: it should match *only* things that actually do
   something on click, not decorative cards or static rows, or the
   highlight becomes noise instead of signal.

2. **`CURRENT_VIEW_SELECTOR`** and **`VIEW_CHANGE_CLASSES`** — how does
   this prototype show/hide screens? OraCare uses one class name
   (`.screen`) for top-level navigation, but *also* a second,
   independent pattern (`.assessment-step`) for swapping content
   *within* a screen (a multi-step form). Both needed to be in
   `VIEW_CHANGE_CLASSES`, or the second one's transitions leave stale
   highlights sitting on the new content for however long the fade-out
   takes — this was a real bug, not a hypothetical. Audit the target
   prototype for *every* pattern that swaps visible content, not just
   the most obvious one, before assuming one selector covers it.

3. **Iframe depth** — count the real layers (`showHighlights` and the
   `onFrameReady` chain both need adjusting to match: zero layers if
   embedding directly with no device-frame-style wrapper, one call to
   `mapRectUp` per layer that actually exists).

Two more things worth checking, lower-stakes:

- **Framing headers**: if the wrapped prototype is on a different host
  than expected, confirm it doesn't send `X-Frame-Options` or a
  restrictive `Content-Security-Policy: frame-ancestors` — either would
  silently block the iframe from loading at all. Not a concern for a
  same-repo, same-deploy setup like this one.
- **Border-radius**: deliberately not read from the target element at
  all (see comment in `showHighlights`) — don't reintroduce
  radius-matching thinking it's an improvement. It was tried, and made
  circular/pill-shaped elements nearly invisible.
