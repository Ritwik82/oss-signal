# OSS Signal — "Renaissance Edition" Redesign Brief

> **DEPRECATED 2026-08-04** — superseded by the "Modern Calibration" reskin
> (decisions.md #57–66): glass surfaces, near-black + teal/magenta, inline SVG circuit
> hero. Painting hero, gold-on-ink palette, and Renaissance art direction are retired.
> This file is kept for history only; do not reintroduce paintings or the old palette.

Target reference: **Shopify Editions Winter '26 (Renaissance Edition)**. This is a full
visual rebuild of OSS Signal in that style. Keep all existing data, routes, scoring logic,
and the bug fixes already shipped — this is a **reskin of presentation only**, not a
rewrite of behavior. If a change would alter scoring, sorting, IDs, or data flow, STOP and
flag it; that is out of scope.

Art direction is AI-generated (no licensed/real paintings). See "Image Assets" below.

---

## The style, decomposed (what actually makes it read as "Renaissance Edition")

1. **Classical oil-painting backgrounds, full-bleed.** Renaissance-style scenes — clouds,
   skies, reaching hands (Sistine echo), marble interiors, pastoral landscapes — sit behind
   content. Muted, aged-pigment palette. Modern UI/cards are composited *on top of* the
   paintings, not beside them.
2. **Persistent left rail index.** A fixed vertical navigation on the left listing sections,
   each paired with a Roman numeral (I, II, III …). Small, uppercase-ish, quiet. Stays put
   while content scrolls.
3. **Enormous serif display type.** Headlines are large, high-contrast serif (think a
   Renaissance/Didone feel). Signature move: an *italic swash ligature* cut into a word
   (Shopify's "Ren·*aissance*"). Pick one hero word to get this treatment.
4. **Aged-pigment palette.** Desaturated: dusty blue, terracotta/rust, sage green, bone
   white, gold leaf accent. NOT bright, NOT neon. Pull colors as if from a 500-year-old
   fresco.
5. **Scroll-driven motion.** Parallax on the painting layers, scenes that cross-fade/morph
   as you scroll, subtle zoom (Ken Burns) on backgrounds. Motion is slow and stately, never
   snappy. Respect `prefers-reduced-motion` — disable parallax/auto-motion when set.
6. **Composited product UI.** Real UI panels (here: the score panels, signal breakdowns,
   specimen cards) float over the art with soft shadows, as if placed into the scene.

---

## Mapping to OSS Signal's actual content

- **Hero:** "Discover / Promising / Open Source" becomes the giant serif headline over a
  sky/clouds painting. Give ONE word the italic-swash treatment (suggest "*Promising*").
  Keep the LIVE SCORING / last-refresh line.
- **Left rail:** replace/augment top nav with the vertical Roman-numeral index. Sections:
  I Station · II Notebook · III Specimens · IV Archive. Keep existing routes intact.
- **Primary readout card** (peak score / projects / signals): render as a composited panel
  floating over the painting, keep the corner-mark motif (now fixed — don't regress it).
- **Archive list:** each specimen card composited over a faint painterly texture. Keep
  `SP-001…` codes, scores, language labels, star counts exactly as-is.
- **Project detail page:** health-assessment panel over a classical background; keep the
  signal breakdown and corner marks (the `relative` container fix must stay).
- **Footer:** keep "Built by Ritwik", disclaimer text, and its now-correct bottom position.

---

## Image Assets (AI-generated)

- Generate a small set (~4–6) of Renaissance-style backgrounds: (a) sky/clouds for hero,
  (b) marble interior, (c) pastoral landscape, (d) a "reaching hands" homage, plus 1–2
  texture/paper overlays.
- Consistency: use one art style/prompt family so they feel like one edition. Aged,
  desaturated, oil-on-canvas, soft. Export optimized web formats (WebP/AVIF), lazy-loaded.
- Do NOT ship multi-MB PNGs — this is a perf risk on Vercel. Compress and set explicit
  width/height to avoid layout shift.
- Store under `/public/art/` with descriptive names. Keep a `CREDITS`/note that these are
  AI-generated originals (avoids any real-artwork licensing question).

---

## Type & Color (starting tokens — tune to taste)

- Display serif: a high-contrast serif (e.g. an open-licensed Didone/"Playfair"-class or
  similar). Body can stay closer to current for legibility; keep a mono accent for the
  `SP-###` codes and signal numbers so the "instrument" DNA still peeks through.
- Palette tokens to define: `--bone`, `--dusty-blue`, `--terracotta`, `--sage`, `--gold`,
  `--ink`. Backgrounds desaturated; text high-contrast against them (check WCAG AA — text
  over paintings needs a scrim/gradient behind it, see below).

---

## Accessibility (do not skip — text-over-art is the main trap)

- Text over paintings MUST stay AA-readable. Use a gradient/scrim layer between art and
  text. Verify contrast, don't eyeball it.
- Honor `prefers-reduced-motion`: no parallax, no auto-zoom, no scroll-morph when set.
- Left-rail index must be keyboard-navigable and have real focus states.
- All art `<img>` needs meaningful `alt` (or `alt=""` + `aria-hidden` if purely decorative).

---

## Build in phases — each phase verified before the next (see Verification)

- **Phase 0 — Spike:** rebuild ONLY the hero over one AI background, with the serif headline,
  swash ligature, left-rail index, and correct scrim/contrast. Get sign-off on the *look*
  before touching the rest. This is the highest-taste-risk part; prove it first.
- **Phase 1 — Palette & type tokens** applied globally.
- **Phase 2 — Archive list** cards composited.
- **Phase 3 — Project detail page** (preserve corner-mark fix).
- **Phase 4 — Scroll motion / parallax** + reduced-motion.
- **Phase 5 — Perf pass:** image compression, lazy-load, Lighthouse.

---

## Verification Protocol (same standard as the bug audit — no self-attestation)

A phase is NOT done until proven against the DEPLOYED site, not the source:

1. **Playwright screenshot of the deployed URL** for the changed area — full viewport, shown
   to Ritwik. "Looks right in the code" does not count.
2. **Contrast check** on any text-over-art (report the ratio, not "looks fine").
3. **Reduced-motion check:** screenshot/behavior with `prefers-reduced-motion: reduce`.
4. **Perf check** (Phase 5): Lighthouse score + total image weight, reported as numbers.
5. Nothing in scoring/sort/IDs/data changed — confirm the archive still reads 62/62,
   scores descending, `SP-###` intact.

If you can't produce the artifact, the phase is "awaiting verification," not done. Do not
round "probably" up to "done." (This is the exact pattern that caused repeated false
"fixed" reports before.)

---

## Explicit risks to acknowledge up front
- This style is a bespoke production; a naive version will look like a cheap pastiche. The
  Phase-0 spike exists to catch that early.
- Semantic tension: Renaissance opulence vs. a lean data instrument. Lean into the contrast
  deliberately (classical frame, instrument-grade data) rather than drowning the data.
- Perf: full-bleed art + scroll motion is heavy. Budget for it from the start.
