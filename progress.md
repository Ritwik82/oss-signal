# OSS Signal — Progress Log

Chronological log of what's been done, what changed, what's next.

---

## 2026-08-04 — Modern Calibration reskin (whole-site visual overhaul)

Replaced the Renaissance Edition look with "Modern Calibration": dark-first minimal
instrument, glass surfaces, teal/magenta accents, serif section display. Decisions #57–66.

**Tokens (`globals.css`):** near-black base, `--color-accent` (teal #00F5D4) /
`--color-accent-magenta` (#FF2D95), muted text raised to `#A0A0A0` (the draft's `#555`
failed AA on near-black at 2.7:1). Legacy palette aliases remapped. New `.glass`,
`.aurora`, `.sweep-line`, `.badge-pulse` utilities. Focus rings moved to accent teal
(amber gone). Stale gold rgba references (status-dot/score-glow/breakdown-bar-fill)
replaced with teal.

**Hero:** painting → inline SVG circuit art (~2KB, theme-aware). `hero-sky.webp` (310KB)
deleted. Signature sweep hairline (#sweep, `@keyframes`, once) then serif headline fades
in; `min-h-screen` → `min-h-[80vh]`. OG/twitter images dropped (referenced deleted file).

**Nav & rail:** left rail → icon-only buttons + hover/focus tooltips (old vertical labels
were unreadable). Mobile hamburger drawer (sm:hidden). Theme toggle moved into the top bar
as a ghost button. Search + score modal stay in the top bar.

**Zones:** Archive → compact glass rows (44px, 24/page, per-row signal breakdown removed →
lives on project page). Watchlist/Fresh → glass cards with hover accent. Fresh Finds now
ship "Copy Obtainium link" (clipboard + toast), "Xd ago" chip, 10px score bar + `X/10`
label, and internal `/project/...` links. Badges pulse once on mount.

**Motion:** right-edge scroll tracker (2px teal, useSpring), hero sweep, view-transition
crossfade (already enabled in next.config), card whileInView reveals — all reduced-motion
gated.

Build `next build` green; `tsc --noEmit` clean. Verification below.

**Verification (2026-08-04, live @ localhost:3100, Playwright + axe):**
- `a11y-audit.mjs` dark AND light: Home 0 violations, Project detail 0 violations;
  keyboard first-Tab → skip-link, solid 2px focus outline. PASS.
- `verify-ui.mjs`: 12 fresh-find cards, all 5 h2 sections present, console errors: none.
- `motion-check.mjs` (kept as `scripts/motion-check.mjs` regression check):
  - scroll tracker animates: mid-scroll transform `matrix(1,0,0,0.578635,0,0)` (scaleY 0.58 — identity `none` at bottom is collapsed `scaleY(1)`).
  - hero sweep fades: `.sweep-line` opacity `0` after 2s (one-shot, gone).
  - Copy Obtainium: toast text `Obtainium link copied.`, clipboard `https://github.com/...` (permissions granted context).
  - Archive: expand btn present, 24 rows page 1, 24 rows page 2 via Next.
  - Mobile drawer (375px): link visible (343x32.5 rect, opacity 1), click navigates to #archive. DOM reads captured in `public/art/verification/drawer-375.png` (vision MCP offline so box-style values read via getComputedStyle rather than screenshot inspection).
- Score modal (glassy dialog): opens, Esc closes, focus returns to opener ("How is a score made?" button). Briefing section blurs (blur(8px)) — see below for the gotcha.
- **Gotcha found via verification (not self-attestation):** Turbopack/Lightning CSS dropped the standard `backdrop-filter` from `.briefing` while keeping `-webkit-` — Chromium then computed `backdrop-filter: none` (no blur) even though the source rule had both, order-independent. Fix: `.briefing` reuses the `.glass` class (which compiles with both properties) and its own backdrop-filter declarations were removed. Also added `title` attribute to left-rail links (aria-label alone gave no visual tooltip).

---

## 2026-08-03 — Global search (top bar) + redeploy [post-Hermes comparison]

User asked whether Hermes's static prototype (`E:\Ritwik\oss-signal`, separate folder)
had UX worth porting. Audited all three prototype extras:
- Archive sort select → **already shipped** (score/stars/new/active/risk + asc/desc + lang/filters).
- Watchlist tabs (All/Needs attention/Fresh) → **skipped**; watchlist already groups
  Needs-attention first, tabs add noise (decision #56).
- Global search → **worth it and missing**; searching required expand-archive first.

**Delivered:** `nav-bar.tsx` now renders a live search input (top bar, right side):
type → combobox listbox of top-8 matches (name/owner/genre + score) sorted by score;
click navigates to `/project/[id]`; Esc or click-outside closes; no match → hint text;
hidden `<sm` to protect nav layout. `page.tsx` passes `projects` prop to NavBar.
No new dep; aria `combobox`/`listbox`/`option`.

**Verified live (local + deployed):** local :3100 — "obtainx" → ObtainX (Store, 9.2),
click navigates to project page, empty query hides list. Deployed
https://oss-signal.vercel.app — "termux" → 2 matches (TermuxHub Utility 8.3). axe dark
PASS. Redeployed via `vercel --prod --yes`.

## 2026-08-03 — DEPLOYED to Vercel (overhaul live + verified)

Decision #13 lifted: pushed the overhaul live via `vercel --prod --yes` (project
already linked, `prj_dbSde8UNzyBK1keAIsqgVk10gQM1`, org team_gzAYbPGjkXdAy1aXICx8nK8a).
Aliased to production domain. Repo NOT pushed to GitHub (still local-only; Vercel CLI
deploy needs no git remote).

**Verified against the LIVE domain (https://oss-signal.vercel.app):**
- `scripts/check-live.mjs`: **19/19 PASS**, 0 console errors (incl. modal opener,
  export buttons, robots.txt, sitemap.xml, project detail page).
- `a11y-audit.mjs` both themes: Home + Project page 0 violations, keyboard first-Tab →
  skip-link, focus outline present — dark AND light.
- Playwright behavior: modal opens (6 signals), Esc closes, focus returns to opener;
  all 3 export downloads produced with correct filenames.

## 2026-08-03 — Sprint 7: Docs close-out (status.md, check-live coverage)

Goal from `mockup-v2.md §3`: `status.md` refresh + deploy readiness + `check-live.mjs`
cover the new surface. Deploy itself stays the user's call (decision #13).

**Delivered:**
- `status.md` rewritten for post-pivot reality: overhaul complete (Sprints 0–7 locally
  verified), pending = deploy decision only, queued = opt-in analytics + one-question
  survey + userscript deferral.
- `scripts/check-live.mjs` — added 4 checks for the new surface: score-modal opener,
  export buttons, robots.txt served, sitemap.xml served (previously only covered the
  3-zone layout + console errors). Now 17 checks.
- Run against live local build (:3100): **17/17 PASS, 0 console errors.**

**Not done (deferred by user decision):** repo push + Vercel deploy. Until then
`oss-signal.vercel.app` serves the pre-pivot build. The overhaul is fully verified on
local prod build.

## 2026-08-03 — Sprint 6: SEO metadata + robots + sitemap + perf (verified)

Goal from `mockup-v2.md §3`: `robots.ts`/`sitemap.ts`, `openGraph`/`twitter` metadata,
image perf pass.

**Delivered:**
- NEW `src/app/robots.ts` — allow all, points at `/sitemap.xml`. Base URL from
  `NEXT_PUBLIC_SITE_URL`, falls back to the Vercel URL (decision #13: not public yet,
  but env override ready).
- NEW `src/app/sitemap.ts` — `/` (priority 1, daily) + all 744 `/project/[id]` pages
  (priority 0.5, weekly), capped at 1000 entries. Static (all SSR-time data).
- `layout.tsx` — metadata upgraded: title template (`%s | OSS Signal`),
  `metadataBase`, `openGraph` (title/description/type/images=hero-sky.webp 1200×630),
  `twitter` (summary_large_image).
- `project/[...id]/page.tsx` — `generateMetadata`: per-project `<title>` incl. score
  (`ObtainX — score 9.2/10 | OSS Signal`) + OG.
- Perf: only ONE `<img>` in the codebase (hero) and it already has
  `fetchPriority="high"` + explicit width/height; 0 others hotlink unmeasured images,
  so no lazy-loading changes needed. `robots.txt` + `sitemap.xml` are statically
  prerendered (shown in build route list).

**Verified via Playwright (live :3100):** robots.txt 200 + contains sitemap link;
sitemap.xml 200 with 745 `<loc>` URLs; `og:title` + `twitter:card` present on home;
project title reads `ObtainX — score 9.2/10 | OSS Signal`. axe 0 violations both themes.

## 2026-08-03 — Sprint 5: Genre classifier (other 35% → 12.2%)

Goal from `mockup-v2.md §3`: shrink the `other` genre bucket to <15%.

**Root cause:** `other` was the fallback for anything that missed the 10-genre
keyword list; F-Droid descriptions use concrete verbs/nouns ("game", "wallet",
"keyboard") that no genre covered.

**Delivered:**
- `data/genres.json` — keyword expansion per observed cluster in the `other` bucket:
  - media: game/arcade/puzzle/rpg/chess/simulator/idle/dungeon, torrent/qbittorrent,
    screencast, youtube/lyrics/song/ringtone/flac, text-to-speech, android tv
  - security: wallet/crypto/bitcoin/ethereum/seed/multisig/mnemonic, onion/tor,
    secret/signer/deepfake/screenshot/spoof/shamir
  - utility: weather/keyboard/ime/ir blaster/printer/bluetooth, syncthing/sync/send,
    nas/unraid, gas station, signal strength, magnetometer, pantry
  - productivity: telegram/lemmy/fediverse, email/mail/chat/messenger, itinerary/travel,
    project management, voice memo, dialer
  - education: dictionary/translate/vocabulary/math, fact check, ancient/egyptian
  - dev-tools: linux/desktop/cad/nvr/docker/raspberry, coding/programming
- NEW `scripts/classify-only.mjs` — offline re-classifier (mirrors `classifyGenre` in
  refresh-data.mjs) that rewrites `genre`/`genre_label` in projects.json WITHOUT a
  40-min API refresh. Pure data transformation; safe to re-run after keyword edits.

**Caught & fixed during QA:** bare `board` keyword matched "keyboard"/"dashboard"
(12 apps misclassified: LeanType/JapaneseKeyboard→media, `bag` Bitcoin dashboard→media).
Removed bare `board`; re-ran; 2 survivors verified CORRECT (Bluke = gamepad app,
lyrion-dashboard = music dashboard). Lesson: substring keywords need a "collision
check" pass (grep other keywords inside the new keyword, e.g. board ⊂ keyboard).

**Result (re-ran classify-only after fix):** `other` 244/744 (32.8%) → 91/744
(**12.2%**, target <15%). Build clean, live :3100 serves new genres, project detail
page 200. Thresholds re-verified: refresh-data.mjs:266 matches decision #17
(<14d fresh / <30d warning / <90d stale / ≥90d abandoned).

## 2026-08-03 — Sprint 4 (part 2): Export buttons (JSON/CSV downloads, verified)

**Delivered:**
- NEW `src/components/export-buttons.tsx` — three client buttons: "Export watchlist
  JSON", "Export watchlist CSV", "Export projects JSON". Builds Blob client-side from
  props (data already server-loaded in page.tsx), downloads via temp `<a>` click,
  filename stamped `watchlist-YYYY-MM-DD.json/.csv`, `projects-YYYY-MM-DD.json`.
  CSV: name,id,genre,source,repo,versions,installed,trackOnly,fdroid,staleness,
  daysSincePush,updateAvailable — quoted per RFC 4180 (`csvEscape`).

**Verified via Playwright (`page.waitForEvent('download')`, live :3100):**
- 3 buttons present; each click produced a real download event with correct filename
  (watchlist-2026-08-03.json, watchlist-2026-08-03.csv, projects-2026-08-03.json).
- axe both themes: 0 violations (rerun after wiring).

**Scar tissue (kill-filter bug):** the kill pattern `*next start -p 3100*` did NOT
match the actual command line (`start  -p`, double space) — the old server (PID 9972)
survived and served the pre-export build, so exports were "missing" from the DOM. Real
fix was killing by owning port (PID from `Get-NetTCPConnection -LocalPort 3100`) not by
command-line substring. Logged in AGENTS.md.

## 2026-08-03 — Sprint 4 (part 1): Shared score modal (live + a11y-verified)

Goal from `mockup-v2.md §3` + decisions #34/#41/#45: one shared "How a score is
made" modal reachable from hero, nav bar, and methodology.

**Delivered:**
- NEW `src/components/score-modal.tsx`: `ScoreModalProvider` (React context +
  `useScoreModal()` hook) rendering a `role="dialog" aria-modal` overlay. Focus trap
  (Tab wraps), Esc closes, focus returns to the opener button, body scroll locked
  while open, overlay click closes.
- `scoring-section.tsx`: `signals` array now `export`ed (single source of truth) and
  extended with `source` + `why` fields per signal (data-source URL provenance +
  threshold rationale per decision #45). Unified shape (S-03 `source_reason` → `why`).
- Openers wired: hero status bar ("How is a score made?"), nav bar (right side,
  accent-bordered button), methodology final-calculation box ("Why these weights and
  thresholds?").
- Modal body: intro line, six signals with dot/name/weight% badge, description,
  formula, source, italic `why` rationale, and the final `Σ(signal × weight) × 10`
  calculation box.

**Verified via Playwright (live :3100, fresh server PID 22172):**
- 3 openers present and in view; dialog opens from hero AND nav; title "How a score
  is made"; 6 signal headings inside dialog; Esc closes; focus returns to the
  opener button (read `document.activeElement` text, not assumed); focus trap wraps
  Tab from last focusable (close button) back inside the dialog.
- axe both themes (Home + Project page): 0 violations (rerun after wiring).

**Stale server struck again:** first server check hit PID 11504 (started 20:16) which
predated the rebuild (BUILD_ID 20:48) — the "How is a score made?" buttons were absent
from the served DOM. Killed by PID, restarted (22172 at 20:50), served HTML then
matched. Same lesson as Sprint 3 — already in AGENTS.md.

## 2026-08-03 — Sprint 3: Accessibility audit (WCAG 2.x clean, both themes)

Goal from `mockup-v2.md §3`: axe audit + keyboard navigation. Wrote
`scripts/a11y-audit.mjs` (axe-core wcag2a/2aa/21aa + keyboard check via Playwright,
`--light` flag toggles theme via `localStorage` init script).

**Root cause found & fixed (stale server):** repeated 500s on chunks like
`0a_c7fpmx4unj.js` + vanished skip-link after reload were NOT app bugs — a leftover
`next start` process (PID 21028, started 19:33) predated a clean `.next` rebuild
(19:58). It kept serving old HTML in memory referencing deleted chunk files. Killed it,
restarted fresh (PID 18736), served HTML now matches `BUILD_ID` on disk. Lesson logged
in AGENTS.md.

**Contrast fixes (verified 4.5:1+ via axe on both themes):**
- `--color-text-dim` dark `#6b6358`→`#9a8f7d`, light `#9a8e7e`→`#6f6a58` (was 3.0:1 / 2.8:1)
- `--terracotta` dark `#a07050`→`#a87858` (was 4.19:1 on watchlist "Needs attention" label)
- light `--color-accent` `#b8860b`→`#855d05` (+ derived rgba tokens; was 2.87:1 on cream)
- light `--color-signal-green` `#3a8a3a`→`#2f6e2f` (UPDATE badge text 3.79:1→pass)
- inline links ("Ritwik", "GitHub ↗") got `underline underline-offset-2` — distinguishable without color

**Results (axe, both themes, local prod build :3100):**
- dark: Home 0 violations, Project page 0 violations
- light: Home 0 violations, Project page 0 violations
- keyboard: first Tab → `a#main-content` (skip-link), focus outline `auto 1px` present

**Verification protocol note:** the audit script needed `browser.newContext()`
(AxeBuilder throws "Please use browser.newContext()" otherwise) and a
`context.addInitScript` setting `oss-signal-theme` in localStorage BEFORE navigation —
the layout themeScript re-applies `dark` on every goto, so post-load class removal is racy.

**Lint debt (pre-existing, untouched):** 6 `react-hooks/*` errors (set-state-in-effect,
static-components) exist in committed files (fresh-finds, project-grid, relative-time,
watchlist-panel, page). Same idiom as the whole codebase; build + tsc clean; not fixed
to avoid churning unrelated files.

### Next actions
- [ ] Sprint 4: interactive surface (search, filters, score modal) per SESSION.md sketch
- [ ] Sprint 5: export JSON/CSV; Sprint 6: data quality (genre classifier `other` 258/744)
- [ ] Sprint 7: robots/sitemap/OG metadata + perf pass
- [ ] Deploy decision

---

## 2026-08-03 — Sprint 1: Renaissance visual pass (gaps closed)

The Renaissance pass (palette tokens, swash headline, painting + scrim, Roman-numeral
left rail, sticky nav) already shipped in commits `ed767ff`/`b9b1396`. Live-audited
against the deployed site and found two real gaps, now fixed + locally verified:

- **NavBar dead links** (`nav-bar.tsx`): pointed at `notebook`/`specimens`, which no
  longer exist after the pivot. Now targets the 5 real zones
  (`station`/`watchlist`/`fresh-finds`/`archive`/`methodology`).
- **Reduced motion** (`hero-section.tsx`): scroll parallax + counter animation now honor
  `prefers-reduced-motion` (parallax frozen, counter renders final value). `design.md`
  required this; it was missing.
- `scripts/check-live.mjs`: removed stale "Specimens h2" check (section no longer exists).

Verification (Playwright, local prod build, port 3100, DOM reads):
- nav links → all 5 hrefs match existing section IDs
- `reducedMotion: reduce` → hero gate `opacity:1, transform:none`, counter `9.2` (final)
- normal → counter `3.8` mid-animation at 400ms
- console errors: 0

Not deployed — user decides. Vision/OCR MCP servers were down during this session
(local verification used DOM reads instead).

### Next actions
- [ ] Deploy (or leave local until more sprints land)
- [ ] Pick next sprint: 2 (morning + instrument surface) or 4 (search/filters/modal)

---

## 2026-08-03 — Mockup v2 review

### What happened
Ritwik pasted a generic SaaS-style mockup + improvement checklist for review. Reviewed it
against the pivot-day idea and `design.md`; it had been corrected for:
- palette (neon → Renaissance tokens), product stance (no accounts/comments/streaks),
  a11y-hostile interactions (carousel/flip/tilt removed), hidden transparency (score modal
  now shared across hero/cards/footer), fake greeting copy (fact-based daily briefing),
  fabricated numbers (all live-bound), duplicate search (one global box).

### Files
- NEW `mockup-v2.md` — the rewritten brief (mockup, checklist, sprints, fixed HTML/CSS sketch)
- `decisions.md` — decisions #33–38 logged

### External review merged (Hermes)
Adopted into `mockup-v2.md`: "Copy Obtainium link" label + toast, score-bar visibility
floor (track ≥10px, proportional fill, number beside bar), briefing date/pin, left-rail
focus order, top-bar "How is a score made?" → shared modal. Rejected: literal 20%-of-card
fill floor (misrepresents low scores) and vibration cue. Decisions #39–43 logged.
Second-pass review merged: pin-toast feedback, semantic state tokens
(`--success/--warn/--danger`), threshold-rationale in score modal, Playwright
focus-return-on-close. Decisions #44–46 logged.

### Next actions
- [ ] Pick a sprint from mockup-v2.md §3 (suggested start: Sprint 1, Renaissance visual pass)

---

## 2026-08-02 — Pivot Day

### Context
This is the day OSS Signal changed direction from a generic GitHub repo list to a personal FOSS Android app dashboard. The trigger was realizing that komi-store + Orion Store had limited catalogs and clanky filtering for finding actively-maintained open-source Android apps. I (Ritwik) decided to build what I actually wanted: a morning view that tells me (1) whether the apps I rely on are going stale, and (2) what's new and worth installing.

### Data files created (new)
- `data/genres.json` — 10-genre taxonomy with keyword classifiers
- `data/watchlist.json` — 34 OSS apps from ObtainX export, categorized

### Files modified
- `src/lib/data.ts` — added GenreId, WatchlistApp, extended Project with 5 new fields
- `scripts/refresh-data.mjs` — rewritten as two-pipeline (Watchlist + Fresh Finds), new scoring with abandonment_risk weight
- `src/components/hero-section.tsx` — subtitle, signal count (5→6), Shizuku count badge
- `src/components/featured-section.tsx` — genre labels + Shizuku badge on cards
- `src/app/page.tsx` — restructured into 3 zones: Watchlist → Fresh Finds → Archive

### Files deleted (old)
- None (no files deleted)

### New files
- `src/components/watchlist-panel.tsx` — Zone 1: all your apps, staleness dots, genre filter
- `src/components/fresh-finds.tsx` — Zone 2: newly discovered apps ≤9mo old
- `data/genres.json`, `data/watchlist.json` (new data source files)
- `README.md`, `status.md`, `progress.md`, `decisions.md`

### Key decisions made today
1. **Keep the OSS Signal name & Vercel infra** — you didn't want to start a new project
2. **Watchlist = seeded once from ObtainX export** — simplest approach
3. **Fresh Finds ≤ 9 months old** — window that balances novelty + stability
4. **Social proof only for generic + low-star apps** — saves API calls, targets noisy ideas
5. **Abandonment risk added as 6th signal (20% weight)** — your #1 pain point is stale apps
6. **Exclude awesome-lists/templates/CS-Fundamentals** — these aren't installable apps
7. **No GitHub push yet** — keep working tree local until deploy

### What broke & fixes
- **F-Droid 52MB download ECONNRESET** → added retry/backoff + 12h disk cache (`.cache/fdroid-index-v2.json`); download now succeeds
- **Whole process died on one DNS failure** (`getaddrinfo ENOTFOUND` on flaky network) → unified `retryFetch` with `AbortSignal.timeout` (60s, 300s for big download), retries on ECONNRESET/ENOTFOUND/ETIMEDOUT/ABORT_ERR/5xx; contributor failures degrade to 0 instead of crashing
- **Hung silently mid-run** → per-request timeouts + batched scoring (5 apps in parallel) + progress logs every 25 apps
- **Detached runs invisible** → launch via `cmd /c "... > run.log 2>&1"` with `GITHUB_TOKEN` set in the same shell call
- **Duplicate React keys** (same GitHub repo shipped via multiple F-Droid packages, e.g. Modern-Apps ×22) → dedupe by repo id keeping highest score (768 → 744), also added to pipeline
- **404 on project pages** — `owner/repo` id has a slash but route was single-segment `[id]`; moved to `[...id]` catch-all that joins segments

### Data results (first full run)
- **Fresh Finds: 744 unique repos** (811 with GitHub/GitLab source of 895 apps added in last 274 days)
- Genre spread: media 128, utility 115, productivity 112, customization 59, security 39, dev-tools 25, shizuku 19, store 7, education 6, other 258
- 14 Shizuku-flagged, 91 generic, 97 abandonment_risk=1
- Watchlist: 19 fresh, 2 warning (Termux 18d, SleepTimer 15d), 5 abandoned (Device Info HW 3536d, AyuGram 1056d, Shizuku 410d, NerdSteam 245d, Neo Store 98d)
- Top scorer: ObtainX (0.719)

### Verification
- `tsc --noEmit` + `npm run build` clean
- Playwright localhost:3000: all 3 zones render, 773 cards, **0 console errors**; screenshots → `public/art/verification/artifact-4/5`
- Project detail page returns 200
- **Deployed to Vercel** (oss-signal.vercel.app, prod alias) — Playwright live verify: 749 cards, all zones, 0 console errors; project page 200
- **Hydration fix** (React #418 on prod): `RelativeTime` was computing `Date.now()` in a `useState` initializer (server/client drift); now renders empty until mounted. Same for the "New" badge in fresh-finds (moved into `useEffect`; component marked `"use client"`)

### Next actions
- [x] Update docs after deploy (status.md)
- [x] Git init + first commit (`bd2b5f0`) — push kept local per user choice
- [x] Live audit: scoring inversion bug fixed, methodology corrected, left rail synced, copy refreshed
- [x] Layout restructure: pagination (12/page with Prev/Next) in Fresh Finds + Project Grid; removed redundant "Specimens" section; methodology moved below archive; left rail updated to match
- [ ] Future: refine `other` genre (258/744 ≈ 35%)
- [ ] Optional: `FeaturedSection` component still exists in repo but unused — safe to delete or repurpose later
- [ ] Future: refine `other` genre (258/744 ≈ 35%)
