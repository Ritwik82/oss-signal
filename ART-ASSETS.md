# OSS Signal — Renaissance Art Assets (Public Domain)

> **DEPRECATED 2026-08-04** — the Renaissance art direction was replaced by the
> "Modern Calibration" reskin (decisions.md #57–66). `hero-sky.webp` was deleted; the hero
> now uses an inline SVG circuit graphic. Do not add paintings back.


All pieces below are pre-1900 European works, **public domain worldwide**. Source them from
**Wikimedia Commons** (or the owning museum's open-access portal). For each: open the
Commons file page, CONFIRM the license reads "public domain / PD-old / PD-art", then
download the highest-res JPEG. Agent: use firecrawl to resolve the actual file URL — do NOT
guess URLs. If a specific piece isn't findable, substitute another PD work in the same role
(see "role" for what matters).

Store in `/public/art/`. Convert to WebP/AVIF, compress hard (target < 400KB each after
compression), set explicit width/height, lazy-load all but the hero. Update
`public/art/CREDITS` with title, artist, year, "Public Domain", and the Commons URL for each.

---

## 1. HERO — sky / clouds (the money shot)
**Primary:** *The Triumph of Galatea* backgrounds aside — better: a luminous sky. Use
**"Cloud Study" by John Constable** (c. 1821–22, several exist) OR **"The Fighting
Temeraire" by J.M.W. Turner** (1839) for a dramatic glowing sky, OR the sky region of
**"Landscape with the Fall of Icarus"** (Bruegel, c. 1560).
- Role: soft, luminous, desaturated sky filling the hero behind the headline. Needs calm
  upper area so the serif headline + scrim sit cleanly.
- Best single pick if you want "Sistine sky": **Raphael / Renaissance cloud-and-putti
  ceiling detail** — but Turner's skies composite best with a scrim.

## 2. "Reaching hands" homage (Sistine echo)
**Primary:** **"The Creation of Adam" by Michelangelo** (Sistine Chapel, c. 1512) — the
near-touching hands detail. Public domain; use a high-res detail crop of the two hands.
- Role: a section-break / accent image echoing the Shopify reaching-hand motif.

## 3. Marble interior / architectural
**Primary:** **"The School of Athens" by Raphael** (1509–11) — the vaulted architecture, or
a crop of the marble hall. Alt: **"Interior of a Gothic Church" by Emanuel de Witte**.
- Role: background for the primary-readout panel or the project detail health-assessment
  panel — cool marble tones behind a floating UI card.

## 4. Pastoral landscape
**Primary:** **"Landscape with the Fall of Icarus"** (Bruegel) OR **any Claude Lorrain
pastoral** (e.g. *Landscape with Aeneas at Delos*, 1672). Warm, hazy, golden.
- Role: warm-toned background for a lower content section / archive intro. Terracotta+sage
  tones live here.

## 5–6. Texture / paper overlays (optional, subtle)
- Aged paper / craquelure (cracked-varnish) texture — searchable as PD "old paper texture"
  or a scan of aged canvas. Used at very low opacity over cards to unify the "edition" feel.
- Gold-leaf / ornamental corner flourish (from any PD illuminated manuscript) for the
  left-rail or corner-mark accents.

---

## Palette to pull FROM the chosen images
Sample real colors out of whichever paintings you pick, so tokens match the art:
`--bone` (highlight/paper), `--dusty-blue` (sky shadow), `--terracotta` (drapery/rust),
`--sage` (foliage), `--gold` (leaf/accent), `--ink` (deepest shadow). This is what makes it
feel like one edition rather than stock art bolted on.

## Hard rules
- Text over any painting MUST have a scrim/gradient behind it and pass WCAG AA — measure it.
- Every art `<img>` gets real `alt` (title + artist) or `aria-hidden` if purely decorative.
- Perf budget: total art weight on first paint should stay modest; hero image priority-loads,
  everything else lazy. Report total KB in the Phase 5 perf pass.
- CREDITS file must list each work's title/artist/year/license/URL. Even PD art gets credited.
