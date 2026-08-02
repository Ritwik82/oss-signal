# OSS Signal — Progress Log

Chronological log of what's been done, what changed, what's next.

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
1. Update docs after deploy (status.md)
2. Git init + first commit + push (when ready)
3. Future: refine `other` genre (258/744 ≈ 35%)
