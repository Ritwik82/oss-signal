# SESSION STATE — OSS Signal overhaul (all-sprints run)

**Purpose:** If this session's context is lost, a fresh agent can resume with zero
re-discovery. Read this + `progress.md` + `decisions.md` (authoritative) before coding.
Last updated: 2026-08-04 (Modern Calibration reskin DEPLOYED + verified live).

---

## 0. Mission

Complete Sprints 0–7 from `mockup-v2.md §3` on the real Next.js codebase
(`E:\Ritwik\projects\oss-signal`). Follow `AGENTS.md` verification protocol:
**never self-attest — verify against the running app via Playwright (DOM reads), report
observed values.** Doc rules: update `decisions.md` on any architectural choice, log
sprints in `progress.md` (newest section at top, under the `---` split).

## 1. Where things stand (exact)

- **Modern Calibration reskin: DONE + DEPLOYED + VERIFIED LIVE (2026-08-04).**
  Committed `958f754`, deployed `vercel --prod --yes`. check-live 19/19 PASS, 0 console
  errors, axe 0 violations dark + light (Home + Project) against
  https://oss-signal.vercel.app. Audit gotcha (found against live, not self-attestation):
  axe reported 169 color-contrast nodes with foregrounds (`#575757` etc.) that exist
  nowhere in the code — it sampled framer-motion reveals / badge-pulse mid-fade. At 2.5s
  settle = 0 violations; with `reducedMotion:"reduce"` on the context = 0 with no wait.
  Fixed the audit script (`c7a07cf`), no app code change. Deployed-but-unused API routes
  `src/app/api/tracked` + `updates` (KV-dependent, no callers) flagged in status.md.
- **Sprint 6 (SEO/perf): DONE + VERIFIED.** NEW `robots.ts` (allow all + sitemap link),
  `sitemap.ts` (745 static URLs: `/` + 744 projects, capped 1000), layout metadata
  (title template, metadataBase, OG, twitter summary_large_image), per-project
  `generateMetadata` with score in title. Base URL from `NEXT_PUBLIC_SITE_URL` env
  (fallback Vercel URL, decision #53). Only `<img>` in codebase is hero (already
  fetchPriority=high + dims). Playwright-verified: robots 200, sitemap 200 w/ 745 locs,
  OG + twitter tags present, project title `ObtainX — score 9.2/10 | OSS Signal`.
  axe 0 both themes.
- **Global search (post-Hermes): DONE + DEPLOYED + VERIFIED.** Prototype audit: sort
  select already shipped, watchlist tabs rejected (grouping leads already), global
  search shipped. `nav-bar.tsx`: live combobox (top-8 matches, score-sorted, click →
  project page, Esc/outside closes, hidden <sm). Verified live: "obtainx"/"termux"
  searches return correct matches + navigation; axe dark PASS. Redeployed (decision
  #56).
- **Sprint 4 part 2 (Export buttons): DONE + VERIFIED.** NEW
  `src/components/export-buttons.tsx` — "Export watchlist JSON / CSV / projects JSON"
  client buttons, Blob + temp `<a>` download, `watchlist-YYYY-MM-DD.{json,csv}` /
  `projects-YYYY-MM-DD.json`. CSV RFC 4180 quoting. Playwright-verified: 3 buttons,
  real download events, correct filenames. axe 0 violations both themes. Scar tissue:
  kill-by-port not command-line substring (`start  -p` double space defeats the
  filter) — AGENTS.md updated.
- **Sprint 5 (Genre classifier): DONE + VERIFIED.** `other` 244/744 (32.8%) → 91/744
  (12.2%, target <15%). Expanded `data/genres.json` keywords by observed cluster
  (games→media, wallets→security, weather/keyboard/IR→utility, dictionary→education,
  telegram/lemmy→productivity). NEW `scripts/classify-only.mjs` re-classifies
  projects.json offline (mirror of refresh-data.mjs `classifyGenre`). QA caught
  `board`⊂`keyboard`/`dashboard` collision (12 apps misclassified) — removed bare
  `board`, survivors (Bluke=gamepad, lyrion=music dashboard) verified correct.
  Thresholds still match decision #17 (refresh-data.mjs:266).
- **Sprint 4 part 1 (Shared score modal): DONE + VERIFIED.** NEW
  `src/components/score-modal.tsx` — `ScoreModalProvider` + `useScoreModal()` context
  hook, mounted once in `page.tsx` around the whole page. Dialog: `role="dialog"`
  `aria-modal` `aria-labelledby="score-modal-title"`, focus trap (Tab wraps first/last),
  Esc close, overlay-click close, body scroll lock, focus returns to opener. Body = the
  exported `signals` array (now `export`ed from `scoring-section.tsx`, enriched with
  `source` + `why` per signal; S-03 `source_reason` merged into `why`) + final
  `Σ(signal × weight) × 10` box. Openers: hero status bar, nav bar right side, methodology
  final-calculation box. Playwright-verified live: 3 openers in view, opens from hero AND
  nav, 6 signals in dialog, Esc closes + focus returns to opener, Tab wraps from last
  focusable. axe 0 violations both themes (rerun). Stale server struck AGAIN (PID 11504
  pre-rebuild) — killed, restarted 22172. Decisions #49/#50 logged.
- **Sprint 0 (Foundations): DONE before this session** — lint/CI/theme/skip-link exist.
- **Sprint 1 (Renaissance visual pass): DONE** — palette tokens, swash "Abandonware"
  headline, painting+scrim (`/art/hero-sky.webp`), Roman-numeral left rail, sticky nav
  all shipped in commits `ed767ff`/`b9b1396`. This session fixed 2 gaps + 1 stale check:
  - `src/components/nav-bar.tsx` — section IDs were `notebook`/`specimens` (pre-pivot
    ghosts, dead anchors). Now: `station`, `watchlist`, `fresh-finds`, `archive`,
    `methodology`.
  - `src/components/hero-section.tsx` — added `useReducedMotion`: counter renders final
    value instantly + scroll parallax frozen (`opacity:1, transform:none`) when
    `prefers-reduced-motion: reduce`. Verified: reduced counter reads `9.2` (final),
    normal reads `3.8` mid-animation at 400ms.
  - `scripts/check-live.mjs` — removed stale "Specimens h2" check (section deleted in
    pivot; it FAILed every live run).
- **Sprint 2 (Morning + instrument surface): CODE DONE, NOT YET VERIFIED/DEPLOYED.**
  - NEW `src/components/daily-briefing.tsx` — fact-based briefing: attention count,
    updates ready, apps pushed ≤7d, new-finds-since-last-visit (localStorage
    `oss-signal-last-visit`), time-aware salutation, exact date, dismiss-for-today
    (`oss-signal-briefing-day`), pin (`oss-signal-briefing-pinned`). Renders `null`
    until mounted (hydration-safe, matches RelativeTime pattern). Facts are real data
    (watchlist/projects props), not hardcoded.
  - `src/components/watchlist-panel.tsx` — groups now **"Needs attention"** (staleness
    stale|abandoned|warning, terracotta label) FIRST, then "Current". Added
    INSTALLED/WATCHING micro-label on each card (replaces lost installed/considering
    split). Header summary uses `attention.length`.
  - `src/app/globals.css` — `.briefing` block (gold corner-marked card, serif salutation,
    mono date/meta, `--` list bullets, `.briefing-btn` + `[aria-pressed="true"]` state).
  - `src/app/page.tsx` — `<DailyBriefing apps={watchlistData.apps} projects={data.projects}
    generatedAt={data.generated_at} />` mounted after HeroSection, before section-divider.
  - Verified: `tsc --noEmit` clean + `next build` clean (last build output above).
- **Sprint 3 (Accessibility core): DONE** — `scripts/a11y-audit.mjs` (axe wcag2a/2aa/21aa
  + keyboard check; `--light` flag switches theme via `context.addInitScript` localStorage
  BEFORE navigation — post-load class removal is racy, layout `themeScript` re-applies
  `dark` on every goto). Results: **0 violations** Home + Project page, BOTH themes.
  Fixed via token changes only: `--color-text-dim` (dark `#6b6358`→`#9a8f7d`, light
  `#9a8e7e`→`#6f6a58`), `--terracotta` dark `#a07050`→`#a87858`, light `--color-accent`
  `#b8860b`→`#855d05` (+derived rgba), light `--color-signal-green` `#3a8a3a`→`#2f6e2f`;
  inline links got `underline underline-offset-2`. Also FIXED a phantom-bug hunt: stale
  `next start` (PID 21028, 19:33) kept serving pre-wipe build HTML (chunks
  `0a_c7fpmx4unj.js`/`1cg9gpiv_3pl_.css` 500'd) — killed, restarted fresh (18736→1200).
  Check server StartTime vs `BUILD_ID` mtime before debugging build-ghosts (AGENTS.md
  scar tissue added). Lint: 6 pre-existing `react-hooks/*` errors in committed files
  (same idiom everywhere); build+tsc clean, not churned.
- **Sprint 4 (Interactive): NOT STARTED.**
- **Sprint 5 (Data quality): NOT STARTED.**
- **Sprint 6 (Perf+SEO): NOT STARTED.**
- **Sprint 7 (Release): NOT STARTED.**

## 2. Environment facts (this session)

- Vision MCP (`vision-mcp-server_analyze_image`) — **DOWN** (model 404). OCR MCP — **DOWN**
  (connection refused). Do NOT rely on screenshots for analysis; use Playwright DOM reads
  + `page.screenshot()` as artifacts only.
- Local server pattern (works, verified): `Start-Process cmd -ArgumentList
  '/c','cd /d E:\Ritwik\projects\oss-signal && npx next start -p 3100 > server.log 2>&1'
  -WindowStyle Hidden` then Playwright against `http://localhost:3100`. Kill via:
  `Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ? { $_.CommandLine -like
  '*next start -p 3100*' } | % { Stop-Process -Id $_.ProcessId -Force }`. Don't use
  `Start-Job` (dies when shell exits).
- Live site `https://oss-signal.vercel.app` = **old build** (pre-Sprint-1-fixes). Deploy
  decision pending (user choice). Repo NOT pushed to GitHub (decision #13) → 6-hourly
  Actions refresh idle; data refreshed manually via `GITHUB_TOKEN=... node
  scripts/refresh-data.mjs`.
- Data: `projects.json` 744 (gen: 2026-08-02T10:27Z), `watchlist.json` 35 apps
  (abandoned 5 / fresh 21 / warning 2 / unknown 7).
- Working tree vs `b9b1396`: modified `src/components/{nav-bar,hero-section,
  watchlist-panel}.tsx`, `src/app/{globals.css,page.tsx}`, `scripts/check-live.mjs`,
  `decisions.md`, `progress.md`; untracked `mockup-v2.md`, `src/components/
  daily-briefing.tsx`, `SESSION.md`(this).

## 3. Sprint 3 — implementation sketch (do first)

Deliverable: axe in CI + keyboard tour + contrast report.
1. `npm i -D @axe-core/playwright` (only new dep; justified).
2. NEW `scripts/a11y-audit.mjs`: Playwright chromium → arg URL (default
   localhost:3100) → `AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa'])` on
   `/` and one project page (`/project/bikram-agarwal%2FObtainX` — get id from
   `data/projects.json` first entry) → print violations (impact, node, failureSummary) →
   exit 1 on any. Also check: skip-link is first tabstop, `:focus-visible` outline
   present on tab, briefing buttons keyboard-reachable.
3. Contrast: script computes `getComputedStyle` pairs for body text vs surface/bg +
   `--color-text-muted` vs `--color-surface` etc. Report ratios (AA = ≥4.5:1 text).
   Fix tokens in `globals.css` only if measured below.
4. Wire into `.github/workflows/refresh-data.yml` (or new `qa.yml`): `npm ci`,
   `npx next build`, `npx next start &`, `node scripts/a11y-audit.mjs`. NOTE: Actions
   idle until repo pushed — still add the workflow.
5. Known risk: `role="checkbox"` genre chips (watchlist) may trip axe (aria-checked on
   button role=checkbox is legal, but no group). Fix only what axe reports on real DOM.
6. Log: `decisions.md` row (axe dep + audit script), `progress.md` Sprint 3 section with
   the audit's violation list pasted (red→green).

## 4. Sprint 4 — implementation sketch

1. **Shared score modal** (rule 2, highest value): NEW `src/components/score-modal.tsx`
   — single `<dialog>`-based (or `div role="dialog" aria-modal`) component showing the
   six signals, weights (from README: recency 24%, momentum 20%, issue_health 16%,
   license 8%, contributors 12%, abandonment 20%), sources (GitHub/F-Droid/ObtainX),
   and threshold rationale (<14d fresh/<30d warn/<90d stale/≥90d abandoned — decision
   #17). Mount once in `page.tsx`; open via context (React `createContext` +
   `useScoreModal` hook) so hero "How is a score made?" (add button to
   `hero-section.tsx`/`nav-bar.tsx`), every card, and methodology footer can open it.
   Focus: trap + return focus to opener on close (Playwright-verified per decision #45
   test).
2. **Export JSON/CSV**: NEW `src/components/export-buttons.tsx` — client buttons
   "Export watchlist JSON / CSV" + "Export projects JSON". Build blob client-side from
   props (data already server-loaded). Place in methodology footer next to ScoringSection.
3. **Global search**: currently only in `project-grid.tsx` (archive-local). If time
   allows: top-bar search (nav-bar) with zone tags (Watchlist/Fresh/Archive), debounce
   300ms. Lower priority than modal+export.
4. Verify: Playwright — modal opens from hero, Esc closes, focus returns; export button
   produces a downloadable file (`page.waitForEvent('download')`).

## 5. Sprint 5 — sketch

1. `other` genre classifier: inspect `data/genres.json` keywords; grep `projects.json`
   for `genre:"other"` names/descriptions; add keyword rows; re-run classification
   WITHOUT full API refresh if possible (classifier is pure — factor it into a small
   `node scripts/classify-only.mjs` that re-classifies existing descriptions offline).
   Target: `other` < 15% (currently 258/744 ≈ 35%).
2. Sparklines: no history exists (single refresh). Add `last_release_at`-based
   "updated Xd ago" chips (already exists). Do NOT fake history; note as deferred with
   reason (data retention = JSON has no time series).
3. Abandonment thresholds: already decision #17; re-verify watchlist staleness mapping
   matches mockup (warning 15d — Termux/SleepTimer are 18d/15d in data; fine).

## 6. Sprint 6 — sketch

1. `src/app/robots.ts` + `src/app/sitemap.ts` (Next conventions; static routes only —
   `/`, `/project/[id]` list from projects.json, cap sitemap size).
2. `layout.tsx` metadata: add `openGraph` (title/description/type website,
   images=/art/hero-sky.webp), `twitter` card, `metadataBase` (Vercel URL once public —
   use relative for now), `alternates.canonical` optional.
3. Perf: hero img already `fetchPriority="high"` + explicit dims. Check other imgs for
   `loading="lazy"` + width/height (project icons — verify none hotlink unmeasured).
   Report total art KB (target <400KB each per ART-ASSETS.md; hero-sky.webp = 309KB OK).
   Set `Cache-Control` via `next.config.ts` headers if static exports used (Vercel
   handles hashed assets; skip if not trivially verifiable).

## 7. Sprint 7 — sketch

Deploy decision (user), opt-in Vercel Analytics (only if user wants; no third-party by
default — rule 10), docs close-out (`status.md` refresh), `check-live.mjs` against live
URL as final artifact. First user-survey = one question in README, not a modal.

### Sprint 7 — ACTUAL STATE (done 2026-08-03)

- `status.md` rewritten (overhaul complete; pending = deploy only).
- `check-live.mjs` now 17 checks (added modal opener, export buttons, robots, sitemap);
  all PASS against local :3100, 0 console errors.
- **DEPLOYED 2026-08-03**: `vercel --prod --yes` (project already linked) → aliased to
  https://oss-signal.vercel.app. Repo NOT pushed to GitHub (decision #55: CLI deploy,
  no remote needed). Verified against the LIVE domain: `check-live.mjs` 19/19 PASS,
  axe 0 violations both themes (Home + Project), modal opens/Esc/focus-return works,
  all 3 exports download with correct filenames. Docs updated (progress/status/
  decisions #55).

## 8. Suggested skills for next agent

`diagnosing-bugs` (if a11y/export breaks), `tdd` (classifier / sort / modal focus
logic), `code-review` (before final commit), `firecrawl-scrape` (only if art sourcing
needed — Sprint 1 has no pending art). Load `ponytail` (repo root AGENTS.md mandates
lazy-senior mode: smallest working diff, no new deps unless justified).

## 9. Non-negotiables (AGENTS.md, distilled)

- Fix = reproduce → fix → verify against RUNNING app (Playwright DOM values pasted) →
  log. No "looks right" claims.
- `display: contents` + framer-motion = invisible elements (known pattern). `relative`
  on corner-mark parents. PDF export blank hero (use screenshot). Data regenerated via
  `scripts/refresh-data.mjs` before blaming schema mismatches.
- Update `decisions.md` + `progress.md` every session; keep `mockup-v2.md` as the
  product brief (supersedes v1).
