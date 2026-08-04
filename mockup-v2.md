# OSS Signal — Product Mockup, Revision 2 ("Instrument Edition")

> **Look note 2026-08-04:** the *product/UX rules* below are current. The *visual
> language* (Renaissance tokens, paintings, gold-on-ink) was superseded by "Modern
> Calibration" (decisions.md #57–66: glass, near-black + teal/magenta, inline SVG hero).
> Palette references below are historical.

**Date:** 2026-08-03
**Status:** Supersedes mockup v1 (the generic SaaS-template draft).
**Relation to `design.md`:** `design.md` owns the *art direction* (Renaissance Edition:
oil paintings, serif, aged pigments). This document owns the *product/UX brief* and is
written to be compatible with it. Where v1 clashed with `design.md`, v2 sides with
`design.md`.

---

## 0. Product stance — the ten rules this mockup obeys

Everything in this document traces back to these. If a feature violates one, it's out.

1. **Personal instrument, not a platform.** No user accounts, no comments, no votes, no
   streaks, no share buttons. OSS Signal is the morning surface for *your* watchlist and
   a discovery surface for *you*. (decisions.md #21: no DB, no auth, $0 forever.)
2. **Transparency is the product.** The 6-signal score model is shown, never hidden. The
   score breakdown is one shared component reachable from the hero, every card, and the
   methodology section — not buried in the footer.
3. **Abandonment risk is the #1 surface, not a badge.** The watchlist leads with status:
   "Needs attention" first, current apps second. (decisions.md #6: stale apps were the
   reason the project pivoted.)
4. **Data in committed JSON; every number on screen is live-bound.** No hardcoded counts,
   no "≈800+" captions, no fabricated greeting stats.
5. **No carousel, no flip cards, no hover-only interactions.** Information that exists
   must be reachable by touch, keyboard, and screen reader alike.
6. **Palette: Renaissance Edition tokens** (bone, dusty blue, terracotta, sage, gold,
   ink). Not neon. Contrast verified against real ratios, never eyeballed.
7. **One search.** A single global box covering the whole catalog, results labeled with
   their zone (Watchlist / Fresh Finds / Archive). The Archive keeps *filters*, not a
   second search.
8. **The daily briefing states facts.** It names what changed and what's at risk. It
   never invents a "review queue" that has no workflow behind it.
9. **Every interactive element is a real control** — `<button>`/`<a>`/`<details>`, with a
   label, focus state, and correct semantics.
10. **$0 forever.** Static output on Vercel Hobby, no database, no third-party scripts by
    default. Analytics are opt-in for the owner only.

---

## 1. High-level UI mockup

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ══ OSS Signal ══ (waveform mark)    ⌕ Search whole catalog…   [How is a score made?]  ☾ │
└────────────────────────────────────────────────────────────────────────────────────────┘
    ┌──────────┐   ┌─────────────────────────────────────────────────────────────────┐
    │ LEFT RAIL│   │  DAILY BRIEFING (once per day, dismissible / pinnable)           │
    │  (fixed) │   │  ┌─────────────────────────────────────────────────────────────┐ │
    │          │   │  │  Good evening. · Tue 04 Aug 2026                            │ │
    │ I   Watch│   │  │  · 2 watchlist apps have not been updated in 90+ days       │ │
    │ II  Fresh│   │  │  · 3 apps updated in the last 7 days                        │ │
    │ III Arch.│   │  │  · 4 new fresh finds since your last visit                  │ │
    │ IV  Meth.│   │  │                              [Dismiss]  [Pin this]           │ │
    │          │   │  └─────────────────────────────────────────────────────────────┘ │
    │          │   │                                                                  │
    └──────────┘   │  ── Section 01 / I — Your Watchlist (sticky section header) ──  │
                   │  Tab:  [ Needs attention (2) ]  [ All (35) ]  [ Fresh (30) ]    │
                   │  ┌──────────────────────────────┬──────────────────────────────┐ │
                   │  │ ▓ AygGram · SP-006     ●●◐   │ ▓ Device Info HW · SP-012 ●●◐ │ │
                   │  │ 0.18 · abandoned 1056d      │ 0.09 · abandoned 3536d       │ │
                   │  │ ▓▓▓▓░░░░░░░░ 18/100        │ ▓▓░░░░░░░░░░ 09/100          │ │
                   │  │ last push 2.9y ago   ⁂⁂⁂     │ last push 9.7y ago   ⁂       │ │
                   │  │ [View signal]               │ [View signal]                │ │
                   │  └──────────────────────────────┴──────────────────────────────┘ │
                   │  (Needs-attention group renders first; current apps below, dimmer │
                   │   border. Card click/tap/keyboard opens a disclosure with repo   │
                   │   link, changelog URL, and "How scored". No flip.)               │
                   │                                                                  │
                   │  ── Section 02 / II — Fresh Finds (grid, no carousel) ─────────  │
                   │  {n} repos added in the last 9 months · sorted by score          │
                   │  ┌──────────────────────────────┬──────────────────────────────┐ │
                   │  │ [icon] ObtainX · SP-001      │ [icon] Termux · SP-003       │ │
                   │  │ store · requires Shizuku    │ utility · no extra access    │ │
                   │  │ [ NEW ] [ ACCESS ]           │ [ NEW ] [ RISK ]             │ │
                   │  │ ▓▓▓▓▓▓▓▓▓▓ 71/100           │ ▓▓▓▓▓▓▓▓░░ 63/100            │ │
                   │  │ added 12d ago   ⁂⁂⁂⁂⁂        │ added 18d ago    ⁂⁂⁂⁂        │ │
                   │  │ [View signal] [Copy link]    │ [View signal] [Copy link]    │ │
                   │  └──────────────────────────────┴──────────────────────────────┘ │
                   │                                                                  │
                   │  ── Section 03 / III — Archive (collapsed by default) ──────────  │
                   │  {n} apps · Filter chips: Genre · Access · Status · Sort ▾       │
                   │  SP-### | icon | name | genre | score bar | last push | stars    │
                   │  … compact rows, 24/page ·  ‹ Prev    Page 3 / 31    Next ›      │
                   │                                                                  │
                   │  ── IV — Methodology + footer ──────────────────────────────────  │
                   │  [ How scores are made ]  (accordion: 6 signals, weights,        │
                   │    sources: GitHub · F-Droid · ObtainX) · [Contribute]           │
                   │  Data refreshed 3h ago · GitHub · Sponsor · 2026 Ritwik ·        │
                   │  "Scores are automated health signals, not endorsements."        │
                   └─────────────────────────────────────────────────────────────────┘
```

Notes on the diagram:

- The waveform mark is a single inline SVG (signal line, gold on bone). No mascot.
- The left rail *is* the Quick-Access: persistent, keyboard-navigable, Roman-numeral
  indexed. The v1 "sticky Quick-Access button" is redundant with it and is deleted.
- The daily briefing shows **facts derived from data** at render time, a time-aware
  salutation (morning/afternoon/evening), once per day via a `localStorage` date key.
- Fresh Finds tags are **text chips** (`NEW`, `ACCESS`, `RISK`) colored by the palette —
  not emoji. Emoji appears nowhere as a control.
- "Copy Obtainium link" (shown compactly as "Copy link" on cards) copies that repo's
  import URL to the clipboard and confirms with a toast — the honest single-user action.
  There is no backend "add to watchlist".
- Every card disclosure is a `<details>/<summary>` or `aria-expanded` button — keyboard
  and screen-reader reachable. "How is a score made?" in the top bar opens the same shared
  modal as the cards and the methodology section.

---

## 2. Checklist of improvements

### Branding & Visual Design
- **Mark:** stylized waveform (a signal, not a mascot) — gold on bone, inline SVG,
  favicon + top-bar corner. Replaces the v1 "⚡/mascot" placeholder.
- **Palette:** Renaissance tokens as CSS variables (`--bone`, `--dusty-blue`,
  `--terracotta`, `--sage`, `--gold`, `--ink`), from `design.md`. One accent per surface.
  No neon anywhere. Ratios verified (≥4.5:1 text, ≥3:1 large/UI), reported as numbers.
- **State tokens:** every stateful color is a semantic CSS variable — `--success`,
  `--warn`, `--danger` for staleness dots/status, `--accent` for interactive states.
  Raw hex never appears in component CSS, so a theme change can't silently break a
  contrast ratio.
- **Typography:** Playfair Display (display, one swash-italic hero word), Space Grotesk
  (UI), JetBrains Mono (SP-### codes, signal numbers). Base 16px, line-height 1.5.
- **Iconography:** ~14-icon inline SVG set (search, refresh, risk, license, genre, stars,
  chevron, close, link, copy, sun/moon, …). Decorative icons are `aria-hidden` with
  adjacent text; standalone icon buttons carry `aria-label`.
- **Imagery & motion:** Renaissance paintings full-bleed behind a readability scrim;
  stately parallax + Ken Burns only. All motion disabled under
  `prefers-reduced-motion`. No flips, no tilts, no snap carousels.

### Responsive Layout
- Mobile-first: 1 column <640px, 2 at 640–1024, 3 at 1024–1280, 4 at >1280.
- Left rail collapses into the top-bar hamburger on phones — with a *working* toggle
  (`:checked` sibling selector), unlike the v1 sketch whose menu did nothing.
- Fluid container (`max-width: 72rem; margin: auto`), no horizontal scroll, explicit
  width/height on all images.

### Accessibility (WCAG 2.1 AA)
- Contrast ≥4.5:1 over paintings enforced by a scrim layer; verify, don't eyeball.
- Full keyboard tour: Tab/Shift+Tab, Enter activates, Esc closes overlays; `:focus-visible`
  gold 2px outline.
- Skip link + landmarks (`nav`, `main`, `footer`, section headings).
- Disclosures are `<details>` or `aria-expanded` buttons — never hover-only.
- Score bars: track ≥10px tall; fill is proportional to the real value with a tiny visible
  floor; the numeric score is always rendered beside the bar (never bar-only). A literal
  "20% of card width" minimum is rejected — it would misrepresent a 5/100 score.
- axe-core scan in CI; NVDA/JAWS spot-check each sprint.

### Usability & Interaction
- Sticky top bar: mark, single global search, "How is a score made?", theme toggle.
- Persistent left-rail index (replaces v1 Quick-Access button).
- Breadcrumbs on project pages (`Home / Archive / Utility / App`).
- Helper text for jargon (abandoned, fresh, Shizuku) via title + `aria-describedby`.
- One global search, debounced ~300ms, results tagged by zone (Watchlist/Fresh/Archive).
- Archive filters as chips (genre, access, status) + sort (recency/score/activity/A–Z)
  with ▲/▼ indicators; pagination stays (12–24/page, no infinite scroll needed).
- Daily briefing: once per day, fact-based, time-aware salutation + exact date, prominent
  keyboard-accessible "Dismiss for today" and a "Pin" that persists across sessions; pin/
  unpin confirm with the same toast component; a "last refreshed" timestamp sits beside
  it, fed by the same data as the footer stamp.
- "Copy Obtainium link" per project: copies that repo's import URL, confirms with a toast
  (no vibration — Android-only, no cross-platform value).
- Watchlist status-ordered with "Needs attention" group first.
- Left rail: Tab order verified with the hamburger open — focus never skips rail items;
  "How is a score made?" in the top bar opens the shared score modal.

### Performance
- Lazy-load images/cards below the fold; `preload` hero art; WebP/AVIF with explicit
  dimensions (no layout shift); art under ~150KB each.
- Cache static assets (`Cache-Control: public, max-age=31536000, immutable` for hashed
  files).
- Vercel Analytics *opt-in for the owner* (LCP/FID/CLS). No third-party script by
  default. Target: LCP <2.5s on 4G.

### Data Presentation
- Score breakdown = one shared modal component, reachable from hero, every card, and
  methodology: six weights, data-source URLs, and *why* each threshold was chosen
  (e.g. <90d vs ≥90d). Not footer-only.
- Score progress bars + last-update sparklines as inline SVG; bars stay honest
  (proportional fill, never a cosmetic floor that hides a real 5/100).
- Export buttons: watchlist JSON/CSV, project data JSON.
- "Data refreshed X ago" stamp (exists) + next-refresh hint from the 6h schedule.
- Every count rendered from data — grep the repo for hardcoded numbers before release.

### Deliberately out of scope (in v1, cut — with reasons)
- **Accounts/OAuth, comments, votes, share links, streaks** — they turn a personal
  instrument into a platform needing DB, auth, and moderation (decisions.md #21).
  Revisit only if the product ever goes multi-user.
- **Metabase/Grafana, Google Analytics** — this tool has one user; README numbers
  suffice. Max: opt-in Vercel Analytics.
- **Blog/news feed** — YAGNI until there is an audience.
- **Marketing footer links (X, LinkedIn, Mastodon)** — the repo isn't public yet
  (decisions.md #13). Keep GitHub + Sponsor.
- **Carousel / tilt / flip** — a11y-hostile and off the Renaissance style.

### Security & Privacy
- HTTPS + HSTS (Vercel handles TLS; enable HSTS header).
- Content-Security-Policy: `default-src 'self'; img-src 'self' data:; …`.
- Rate-limit only if an API endpoint is ever public; otherwise nothing to abuse.
- Data retention: data lives in committed JSON — deleting your data means deleting the
  file and rebasing history; document that plainly.

### SEO (only once public)
- OG/Twitter cards (title, description, image), robots.txt + sitemap generated at build.
- Clean routes (`/`, `/project/[...id]`) with 301s if anything ever renames.

### Testing & QA
- Playwright suite: skip-link is the first focusable element; briefing first-load vs
  repeat; search, filters, sort, theme toggle; disclosure — focus must return to the
  controlling `<summary>`/button after close.
- axe-core scan in CI; cross-browser (Chrome/Firefox/Safari/Edge); ESLint + TS strict.

### Future-proof Infrastructure (trimmed)
- Docker optional (static output + Nginx); CI/CD is already Vercel on push.
- Backups: the refresh workflow also dumps `data/*.json` to a private gist/cloud bucket.

---

## 3. Prioritisation blueprint

| Sprint | Goal | Core deliverables |
|--------|------|-------------------|
| 0 — Foundations | Verify what exists | Lint/CI green, theme toggle, skip link, repo hygiene. Mostly done — audit and close gaps. |
| 1 — Renaissance visual pass | The look from `design.md` lands | Palette tokens in `globals.css`, serif + swash hero headline, paintings + scrim, sticky top bar, left-rail index. |
| 2 — Morning + instrument surface | The daily habit, done honestly | Fact-based daily briefing (once/day, time-aware), watchlist status-ordered with "Needs attention" group, text chips replace emoji tags. |
| 3 — Accessibility core | AA, proven | axe passes in CI, keyboard-only tour works, disclosures keyboard/touch-reachable, reduced-motion honored, contrast ratios reported. |
| 4 — Interactive components | Find and understand anything | Single global search with zone tags, archive filter chips + sort, shared score-breakdown modal, export JSON/CSV. |
| 5 — Data quality | The signal gets sharper | `other` genre classifier (258/744 → target <15%), abandonment threshold tuning, sparklines fed by refresh history. |
| 6 — Performance & SEO | Fast + shareable when public | Art compression, lazy-load, OG cards, sitemap, Lighthouse 90+ reported as numbers. |
| 7 — Release & iterate | Ship and learn | Deploy, opt-in analytics, first user-survey (one question, not a modal empire), decision on making the repo public. |

---

## 4. Quick-start wireframe (fixed)

The v1 sketch had three real bugs: `viewport` was set on `<html>` (not an attribute),
the hamburger CSS had no `:checked` rule (the menu did nothing), and the dark-mode
"toggle" was an `<a href="#">`. All fixed below; palette is the Renaissance token set,
not neon.

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>OSS Signal</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header class="top-bar">
    <div class="brand">
      <svg class="mark" aria-hidden="true" viewBox="0 0 24 12"><path d="M0 6h4l2-4 3 8 3-12 3 10 2-4h7" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
      <span class="brand-name">OSS Signal</span>
    </div>

    <input type="search" id="global-search" class="global-search"
           placeholder="Search the whole catalog…" aria-label="Search the whole catalog">

    <button type="button" id="theme-toggle" aria-pressed="false" class="theme-toggle">Light</button>

    <a href="#methodology" class="how-scored">How is a score made?</a>

    <nav class="main-nav" aria-label="Main navigation">
      <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle navigation">
      <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true">Menu</label>
      <ul class="menu">
        <li><a href="#watchlist">I · Watchlist</a></li>
        <li><a href="#fresh">II · Fresh Finds</a></li>
        <li><a href="#archive">III · Archive</a></li>
        <li><a href="#methodology">IV · Methodology</a></li>
      </ul>
    </nav>
  </header>

  <main id="main-content">
    <section class="briefing" aria-label="Daily briefing">
      <p class="salutation">Good morning.</p>
      <p class="briefing-date"><time id="briefing-date"></time></p>
      <ul>
        <li>2 watchlist apps have not been updated in 90+ days.</li>
        <li>4 new fresh finds since your last visit.</li>
      </ul>
      <div class="briefing-actions">
        <button type="button" class="briefing-dismiss">Dismiss for today</button>
        <button type="button" class="briefing-pin" aria-pressed="false">Pin</button>
      </div>
    </section>

    <section id="watchlist" class="zone" aria-labelledby="watchlist-title">
      <h2 id="watchlist-title">I · Your Watchlist</h2>
      <div class="grid watch-grid">
        <article class="card" tabindex="0" aria-label="AygGram, abandoned, score 18">
          <div class="card-head">
            <span class="icon" aria-hidden="true">▣</span>
            <h3>AygGram</h3>
            <span class="staleness-dot staleness-abandoned" aria-hidden="true"></span>
          </div>
          <p class="meta">SP-006 · 0.18 · abandoned 1056d</p>
          <div class="scorebar" role="img" aria-label="Score 18 out of 100">
            <span class="scorebar-fill" style="width:18%"></span>
          </div>
          <details class="card-detail">
            <summary>View signal</summary>
            <p>Last push 2.9 years ago · <a href="https://github.com/AyuGram/AyuGramDesktop">repo</a> ·
               <a href="#score-modal">How scored</a></p>
          </details>
        </article>
      </div>
    </section>

    <section id="fresh" class="zone" aria-labelledby="fresh-title">
      <h2 id="fresh-title">II · Fresh Finds</h2>
      <div class="grid fresh-grid"><!-- same card anatomy, plus text chips + "Copy Obtainium link" (data-copy="{importUrl}") --></div>
    </section>

    <section id="archive" class="zone" aria-labelledby="archive-title">
      <h2 id="archive-title">III · Archive</h2>
      <form class="filters" aria-label="Filter archive">
        <select name="genre" aria-label="Filter by genre"><option>Genre: All</option></select>
        <select name="access" aria-label="Filter by access"><option>Access: All</option></select>
        <select name="status" aria-label="Filter by status"><option>Status: All</option></select>
        <button type="button" class="sort" aria-sort="descending">Sort: Score ▾</button>
      </form>
      <div class="grid archive-grid"><!-- compact rows, pagination below --></div>
    </section>
  </main>

  <footer id="methodology">
    <details>
      <summary>How scores are made</summary>
      <p>Six mechanical signals — recency 24%, momentum 20%, issue health 16%,
         license 8%, contributors 12%, abandonment risk 20%. Sources: GitHub, F-Droid, ObtainX.</p>
    </details>
    <nav aria-label="Project links">
      <a href="https://github.com/Ritwik82">GitHub</a>
      <a href="#sponsor">Sponsor</a>
    </nav>
    <p class="fineprint">2026 Ritwik · Scores are automated health signals, not endorsements.</p>
  </footer>

  <div class="toast" role="status" aria-live="polite"></div>

  <script src="app.js"></script>
</body>
</html>
```

```css
/* styles.css — Renaissance tokens (from design.md), not neon */
:root {
  --ink: #1a1714;
  --bone: #efe9dc;
  --dusty-blue: #5b6c7d;
  --terracotta: #b0563f;
  --sage: #6d7a5f;
  --gold: #c9a227;
  --text: var(--bone);
  --text-muted: #b9b0a0;
  --bg: var(--ink);
  --border: #3a332c;
  --accent: var(--gold);
  --font-sans: "Space Grotesk", system-ui, sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
[data-theme="light"] {
  --text: var(--ink);
  --text-muted: #4d463c;
  --bg: var(--bone);
  --border: #d8cfbd;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-sans); font-size: 16px; line-height: 1.5;
  background: var(--bg); color: var(--text); max-width: 72rem; margin: 0 auto;
}
a { color: var(--accent); }
h1, h2, h3 { font-family: var(--font-serif); }

.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 0.5rem; top: 0.5rem; background: var(--gold);
  color: var(--ink); padding: 0.5rem 1rem; z-index: 100; }

.top-bar {
  position: sticky; top: 0; z-index: 50; display: flex; align-items: center; gap: 1rem;
  padding: 0.6rem 1rem; background: var(--bg); border-bottom: 1px solid var(--border);
}
.brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; }
.mark { color: var(--gold); width: 28px; }
.global-search { flex: 1; max-width: 26rem; padding: 0.45rem 0.7rem; border-radius: 4px;
  border: 1px solid var(--border); background: var(--bg); color: var(--text); }
.theme-toggle { border: 1px solid var(--border); background: transparent; color: var(--text);
  padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; }

.menu { list-style: none; display: flex; gap: 1rem; }
.nav-toggle, .nav-toggle-label { display: none; }
@media (max-width: 640px) {
  .nav-toggle-label { display: block; cursor: pointer; }
  .menu { display: none; position: absolute; right: 1rem; top: 3rem; flex-direction: column;
    background: var(--bg); border: 1px solid var(--border); padding: 0.75rem; }
  .nav-toggle:checked ~ .menu { display: flex; }   /* the toggle v1 forgot */
}

.briefing { margin: 1.5rem 1rem; padding: 1rem; border: 1px solid var(--gold);
  border-radius: 6px; background: color-mix(in srgb, var(--bg) 92%, var(--gold)); }
.briefing .salutation { font-family: var(--font-serif); font-style: italic; font-size: 1.3rem; }
.briefing ul { margin: 0.5rem 0 0.75rem 1.25rem; }
.briefing-actions { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
.briefing-date { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); }
.toast { position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%);
  background: var(--sage); color: var(--ink); padding: 0.5rem 1rem; border-radius: 4px;
  font-weight: 600; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 200; }
.toast.show { opacity: 1; }

.zone { padding: 2rem 1rem; }
.grid { display: grid; gap: 1rem; }
.watch-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }

.card { border: 1px solid var(--border); border-radius: 6px; padding: 0.9rem; }
.card:focus-within, .card:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
.card-head { display: flex; align-items: center; gap: 0.5rem; }
.meta { font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted); margin: 0.35rem 0; }
.scorebar { height: 10px; background: var(--border); border-radius: 4px; overflow: hidden; }
.scorebar-fill { display: block; height: 100%; min-width: 4px; background: var(--sage); }
.staleness-dot { width: 8px; height: 8px; border-radius: 50%; margin-left: auto; }
.staleness-fresh { background: var(--sage); }
.staleness-warning { background: var(--gold); }
.staleness-abandoned { background: var(--terracotta); }

.filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }

footer { border-top: 1px solid var(--border); padding: 1.5rem 1rem; }
.fineprint { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.75rem; }

/* A11y: real focus ring, both themes */
:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
/* A11y: no scroll animation for reduced-motion users */
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
```

```js
/* app.js — theme + once-daily briefing. Facts would be rendered from data/, not faked. */
const themeBtn = document.getElementById("theme-toggle");
themeBtn.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  themeBtn.setAttribute("aria-pressed", String(next === "light"));
  themeBtn.textContent = next === "dark" ? "Light" : "Dark";
  localStorage.setItem("oss-signal-theme", next);
});

const today = new Date().toDateString();
const KEY = "oss-signal-briefing-day";
const pinned = localStorage.getItem("oss-signal-briefing-pinned") === "1";
const briefed = localStorage.getItem(KEY);
const hour = new Date().getHours();
const salutation = hour < 5 ? "Good night" : hour < 12 ? "Good morning"
  : hour < 18 ? "Good afternoon" : "Good evening";
const dateEl = document.getElementById("briefing-date");
if (dateEl) dateEl.textContent = new Date().toLocaleDateString(undefined,
  { weekday: "long", year: "numeric", month: "long", day: "numeric" });

if (!pinned) {
  if (briefed !== today) {
    document.querySelector(".salutation").textContent = salutation + ".";
    localStorage.setItem(KEY, today);
  } else {
    document.querySelector(".briefing").hidden = true;
  }
}
const pinBtn = document.querySelector(".briefing-pin");
pinBtn.addEventListener("click", () => {
  const nowPinned = localStorage.getItem("oss-signal-briefing-pinned") === "1";
  localStorage.setItem("oss-signal-briefing-pinned", nowPinned ? "0" : "1");
  pinBtn.setAttribute("aria-pressed", String(!nowPinned));
  pinBtn.textContent = nowPinned ? "Pin" : "Pinned";
  showToast(nowPinned ? "Briefing unpinned." : "Briefing pinned.");
});
document.querySelector(".briefing-dismiss").addEventListener("click", () => {
  document.querySelector(".briefing").hidden = true;
  if (!pinned) localStorage.setItem(KEY, today);
});

const toast = document.querySelector(".toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      showToast("Obtainium link copied.");
    } catch {
      showToast("Copy failed — grab the URL from the card.");
    }
  });
});
```

How to test (same as v1, plus fixes to check):
1. Save `index.html` and `styles.css` in one folder, open in a browser.
2. Resize — grid collapses to one column; the hamburger now *actually opens the menu*.
3. Press Tab repeatedly — focus ring (gold) is visible everywhere, skip link first.
4. Toggle theme — palette swaps to bone/ink; `aria-pressed` flips.
5. Reload after dismissing the briefing — it stays hidden until tomorrow's date.

---

## 5. Takeaway

- The instrument identity is the differentiator: mechanical, transparent, personal.
- Visual polish + accessibility = trust; honesty about scope = a shippable personal tool.
- The daily habit is the greeting's *facts* ("2 apps at risk"), not gamification.

Next decision point — pick a sprint, or ask me to start Sprint 1 (Renaissance visual
pass) on the real codebase.
