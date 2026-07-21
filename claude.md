
# Portfolio Project Rules

# STOP. READ THIS FIRST. DO NOT SKIP.

Before touching ANY file:
1. State which files you will modify and why
2. Wait for explicit approval before making ANY change
3. Never implement anything speculatively
4. Never delete or modify anything not explicitly mentioned in the task
5. If unsure — ASK, do not guess

VIOLATIONS OF THESE RULES HAVE CAUSED HOURS OF WASTED WORK.

## !! APPROVAL RULE — READ THIS FIRST, EVERY TIME !!
- **NEVER implement any change until the user explicitly says to go ahead.** This applies to every single edit, no matter how small, how "obviously correct," or how confident you are. There is no such thing as a fix safe enough to skip this.
- Questions ("what do you think?", "how would you do it?", "what would you use?"), sharing references, or describing a goal are NOT approval.
- Explicit approval sounds like: "do it", "go ahead", "implement that", "yes", "looks good, make it".
- When in doubt: propose, explain, and WAIT. Do not touch files.
- **Investigating, diagnosing, and proactively flagging issues is encouraged and does NOT need approval** — grep, read, audit, compare against git history, tell the user what you found. This is genuinely valuable and should continue. The line is: report and propose, then stop. Do not slide from "I found a problem" into "and here's the fix I already made."
- This applies even when a fix looks like pure restoration of something already agreed earlier (e.g. recovering work lost to an accidental revert). "This was already approved once" is not the same as "approved right now" — surface what you found and ask before re-applying it.
- This applies even when you go looking for more of the same problem on your own initiative (a "let me sweep for anything else like this" check). Finding more instances is good; fixing them without asking first is not — report what the sweep turned up and wait.
- **Exception: committing and pushing already-implemented, already-approved changes to git does not need a fresh per-instance confirmation.** Once code changes are approved and applied, wrapping them into a commit and pushing is fine to just do.
- Violating this rule is the most serious mistake possible on this project. It has happened repeatedly, including multiple times in a single session after the user explicitly praised the investigative work but not the unrequested fixes that followed it. Do not let it happen again.




# Project Design & Frontend Rules

## Design System
- Use 8pt spacing system
- 4px spacing allowed only for optical alignment
- Preserve whitespace and airy layouts
- Avoid cramped sections

## Spacing System
- Allowed values ONLY: 4px (micro only), 8px, 16px, 24px, 32px, 40px, 48px, 64px, 80px, 96px
- NEVER use: 14px, 20px, 28px, 36px, or any value not on this list for layout or spacing
- If reducing a spacing value, always pick the next valid value down on the list
- 4px is for borders, icon padding, and fine-tuning only — not layout gaps or margins

## Typography
- Body text default: 20px
- Sora headings use font-weight 500 only
- Maintain typography consistency
- Do not use font-weight 600, 700 or 800 for Sora — 500 only unless explicitly requested or set by the user manually

## Accessibility
- Always maintain WCAG contrast ratios
- Never use white text on orange buttons
- Accessibility before decoration

## CSS Rules
- Never use inline styles
- Before proposing or creating any new CSS custom property, grep for existing tokens with the same value. If one exists and the intent is the same, use it. Do not create semantic aliases unless there is a stated reason the values will diverge.
- Avoid duplicate styles
- Keep CSS modular
- Add new styles in relevant sections only
- Never use `font-size: 0` to hide text inside flex containers — it collapses line metrics and makes SVG icons invisible. Instead wrap the text in a `<span class="*-label">` and use `display: none` on that span at the relevant breakpoint.
- Never use absolute positioning for primary layout flow. Use flex/grid layout for structural positioning and reserve absolute positioning for decorative elements only.

## Layout Rules
- Mobile-first responsive approach
- Maintain navigation consistency
Approved responsive system:
- Desktop: default styles (1280px+ target)
- Tablet/layout collapse: @media (max-width: 1279px)
- Mobile navigation/layout shift: @media (max-width: 809px)
- Small mobile refinements only: @media (max-width: 480px)
Do not introduce legacy breakpoints:
960px, 900px, 768px, 560px
- When merging or reorganising breakpoints, identify and remove intermediate overrides that are made redundant by the merge
- Avoid independently scaling related UI elements (e.g. decorative background text + foreground content). Use proportional clamp() relationships so connected elements scale together across breakpoints.

## Workflow
- Do not implement any change until the user explicitly approves it. Phrases like "let's try", "what would you use", "how would you do it", or "what tokens" are questions — not instructions to edit. Wait for a clear go-ahead before touching any file.
- Research existing structure before editing
- Do not rewrite entire files unnecessarily
- Keep edits modular
- Explain which files will be modified before making changes
- **Never push to GitHub unless the user explicitly says to push.**
- **Never commit unless the user explicitly says to commit.** Make file edits only; do not run `git add` or `git commit` until directly instructed.

## Known Mistakes To Avoid
- Do not use dark backgrounds
- Do not repeat section titles
- Do not add fake metrics or placeholder statistics
- Never use a decorative line (horizontal or vertical rule via ::before or ::after) before overline labels, eyebrow text, or section labels — this pattern is explicitly rejected; if found in existing code, flag it to the user and wait for approval before removing
- Do not invent random spacing values — always use the allowed list above
- Do not create inconsistent button styles
- Do not introduce new typography systems
- Do not use off-grid spacing like 14px or 20px even when "slightly reducing" a gap — always step down to the next valid value (e.g. 20px → 16px, not 14px)
- When asked to audit a specific category (e.g. layout containers), do not include adjacent categories that were not requested (e.g. typography line-length constraints). max-width on a text element is not the same as a layout container. Stay strictly within the defined scope.

## CSS Typography Lessons
- When text overflows on mobile, only the vw value inside clamp() matters at a specific viewport. Don't touch min/max unless the problem is at extreme screen sizes.
- Never change unrelated properties (white-space, letter-spacing) when only font size is the issue.
- white-space: nowrap allows text to overflow its box regardless of element width — font-size vw value is the only control.
- min-width: 0 on flex items prevents them growing beyond container based on content size.

## Hard Lessons Learned (keep these)
- Decorative and content elements that must align visually MUST share the same parent container.
- When something breaks across breakpoints, stop tweaking values — diagnose the container structure first.
- Before implementing any layout, inspect a reference example's actual HTML structure.
- Never mix absolute positioning for content with normal flow for related content in the same visual group.
- When debugging overflow, check computed width in dev tools before guessing fixes.
- Footer layout failures follow a pattern: absolute positioning, negative margins, and aspect-ratio hacks all break. The fix is always structural — put related elements in the same parent and use flex layout. Stop tweaking values and fix the container.
- Always grep for the current string before editing. External edits change files between tool calls. A failed string match means the file was modified — find the current content first, then edit.

## Continuous Improvement
- Add recurring Claude mistakes to this file after correcting them
- Always read this file at the start of each session before doing anything
- Learn from previous implementation errors

---

# Vertical Rhythm & Responsive Spacing Rules

## Core layout principle

Sections own OUTER spacing.
Internal elements own INNER spacing.

Meaning:

* sections create spacing BETWEEN major page regions
* section internals create spacing INSIDE the section
* components should not independently create large external spacing

Avoid compounded spacing.

Do not stack:

* large section padding
* section-header padding-bottom
* section-header margin-bottom
* component top margins
  simultaneously unless intentionally art-directed.

---

# Section spacing responsibilities

## Sections

Sections control macro vertical rhythm.

Use:

* padding-top
* padding-bottom
* padding-block

for spacing between major layout regions.

Avoid adding large top margins/padding to:

* first child elements
* first cards
* first grids
  inside already padded sections.

---

## Section headers

Section headers control spacing between:

* heading area
* and content below.

Preferred:

```css
.sec-header {
  margin-bottom: ...;
}
```

Avoid unnecessary:

```css
padding-bottom
```

inside section headers unless visually justified.

Prefer:

* one spacing source
  instead of multiple stacked spacing layers.

---

## Components

Cards, grids, lists, and content groups:

* manage internal spacing only
* avoid large outer spacing
* rely on section rhythm for separation

Avoid:

* large margin-top on first child
* large margin-bottom on last child
  inside already padded sections.

---

# Responsive spacing compression

Spacing compresses from:
DESKTOP → TABLET → MOBILE

Compression is optical, not mathematically proportional.

Large spacing compresses aggressively.
Small spacing compresses minimally.

---

# Canonical spacing compression map

| Desktop | Tablet | Mobile  |
| ------- | ------ | ------- |
| 128px   | 96px   | 64px    |
| 104px   | 80px   | 56px    |
| 96px    | 72px   | 56px    |
| 80px    | 64px   | 48px    |
| 64px    | 48px   | 32-40px |
| 56px    | 40px   | 32px    |
| 48px    | 32px   | 24px    |
| 40px    | 32px   | 24px    |
| 32px    | 24px   | 20px    |
| 24px    | 20px   | 16-20px |
| 16px    | 16px   | 12-16px |
| 8px     | 8px    | 8px     |

---

# Compression priorities

Compress most aggressively:

* hero spacing
* section spacing
* large layout gaps
* footer spacing
* spacing between stacked layout regions

Compress moderately:

* card padding
* section-header spacing
* grid gaps

Compress minimally:

* chip spacing
* icon/text spacing
* button spacing
* compact metadata spacing
* micro alignment spacing

---

# Editorial exceptions

Allowed intentional exceptions:

* hero compositions
* art-directed whitespace
* prose rhythm
* masonry layouts
* optical typography adjustments
* visual grouping tweaks

Do not normalize intentional editorial spacing unless it creates obvious layout imbalance.

---

# UX & Accessibility Standards

Apply these principles across layouts, screens, interactions, components, responsive behavior, and frontend implementation.

Focus: clarity, accessibility, structure, readability, and maintainable UX.

---

## Core UX Principles

MUST prioritize clarity over decoration
MUST reduce cognitive load and unnecessary complexity
MUST maintain predictable layouts and interaction patterns
MUST create clear visual hierarchy and scanning flow
MUST make primary actions obvious
MUST provide visible feedback for interactions
MUST keep layouts visually balanced across breakpoints
MUST preserve readability and comfortable line length
SHOULD favor simple, familiar interaction patterns
SHOULD reduce unnecessary nesting and visual noise
SHOULD support fast scanning and comprehension
NEVER add UI elements purely for trend aesthetics
NEVER sacrifice usability for visual experimentation
NEVER overload screens with competing focal points

---

## Accessibility Standards

MUST use semantic HTML structure
MUST maintain proper heading hierarchy
MUST ensure keyboard accessibility
MUST preserve visible focus states
MUST support reduced motion preferences
MUST maintain WCAG AA contrast minimums
MUST use relative typography units (rem/em)
MUST ensure interactive elements remain accessible at zoom levels
SHOULD provide clear landmarks and page regions
SHOULD preserve logical reading and tab order
SHOULD avoid excessive motion and animation
NEVER remove focus outlines without replacement
NEVER rely only on color to communicate meaning
NEVER hide interactions behind hover-only behavior
NEVER use inaccessible motion or flashing effects

---

## Typography & Readability

MUST preserve clear type hierarchy
MUST maintain readable line-height and spacing
MUST keep line length comfortable for long-form reading
MUST prioritize readability over stylistic typography
SHOULD use restrained font combinations
SHOULD maintain consistent spacing rhythm around text
SHOULD favor dark grey text over pure black
NEVER center-align large blocks of text
NEVER use decorative typography for functional content
NEVER weaken contrast for aesthetic minimalism

---

## Responsive Layout Behavior

MUST preserve layout clarity across breakpoints
MUST compress macro spacing progressively on smaller screens
MUST maintain consistent container alignment
MUST avoid accidental whitespace inflation from compounded spacing
SHOULD reduce hero spacing on tablet/mobile
SHOULD simplify layouts as width decreases
SHOULD maintain strong visual anchors at all sizes
NEVER allow oversized empty viewport regions on mobile
NEVER crowd screen edges with dense content
NEVER allow spacing systems to stack redundantly

---

## Interaction & Motion

MUST provide visible hover/focus/active states
MUST keep interactions responsive and predictable
MUST preserve accessibility during animation
SHOULD use subtle motion for feedback only
SHOULD avoid excessive transitions and decorative animation
SHOULD keep animation timing restrained (200–500ms)
NEVER use motion that blocks interaction
NEVER rely solely on animation for communication
NEVER introduce motion that distracts from content

---

## Buttons & Actions

MUST clearly communicate button purpose
MUST differentiate primary vs secondary actions visually
MUST preserve adequate touch target sizing
SHOULD keep CTA hierarchy visually restrained
SHOULD preserve consistent button behavior across pages
NEVER overload one button with multiple meanings
NEVER rely solely on color for button distinction
NEVER place destructive actions near primary actions

---

## Forms & Inputs

MUST preserve persistent labels
MUST provide clear inline error messaging
MUST preserve accessible focus behavior
SHOULD minimize cognitive load in forms
SHOULD support autofill and paste behavior
NEVER rely on placeholders as labels
NEVER validate aggressively while typing
NEVER use ambiguous error language

---

## Design System & Frontend Standards

MUST keep tokens and implementation consistent
MUST preserve semantic structure in CSS and HTML
MUST maintain reusable patterns where beneficial
SHOULD preserve editorial flexibility where visually justified
SHOULD avoid unnecessary abstraction layers
SHOULD prioritize maintainability over token purity
NEVER over-engineer the design system
NEVER introduce abstraction without practical benefit
NEVER duplicate component behavior unnecessarily
