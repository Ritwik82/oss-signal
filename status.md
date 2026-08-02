# OSS Signal — Project Status

**Last updated:** 2026-08-02

---

## Current state

**Pivot complete (locally verified).** Personal FOSS Android app dashboard with two surfaces: Watchlist (35 apps) and Fresh Finds (744 repos from F-Droid, last 274 days).

## What's done

| Item | Status | Date |
|------|--------|------|
| Genre taxonomy (`data/genres.json`) | ✅ Done | 2026-08-02 |
| Watchlist seed (`data/watchlist.json` — 35 apps) | ✅ Done | 2026-08-02 |
| Data layer update (`src/lib/data.ts`) | ✅ Done | 2026-08-02 |
| Two-pipeline refresh script (`scripts/refresh-data.mjs`) | ✅ Done | 2026-08-02 |
| WatchlistPanel component (Zone 1) | ✅ Done | 2026-08-02 |
| FreshFinds component (Zone 2) | ✅ Done | 2026-08-02 |
| ProjectGrid adapted (Zone 3, collapsible + new schema fields) | ✅ Done | 2026-08-02 |
| FeaturedSection adapted (genre labels + Shizuku badge) | ✅ Done | 2026-08-02 |
| HeroSection adapted (subtitle, 6 signals, Shizuku count) | ✅ Done | 2026-08-02 |
| `page.tsx` restructured (3 zones: Watchlist → Fresh → Archive) | ✅ Done | 2026-08-02 |
| `tsc --noEmit` — zero errors | ✅ Done | 2026-08-02 |
| `npm run build` — clean build, all routes prerender | ✅ Done | 2026-08-02 |
| Fresh Finds pipeline run (768 raw → 744 deduped repos) | ✅ Done | 2026-08-02 |
| Network resilience (retry + timeout + cache + batches) | ✅ Done | 2026-08-02 |
| Playwright local verify (3 zones, 773 cards, 0 console errors) | ✅ Done | 2026-08-02 |
| Project page route fixed (`[id]` → `[...id]` catch-all) | ✅ Done | 2026-08-02 |
| Hydration mismatch fixed (RelativeTime + New badge) | ✅ Done | 2026-08-02 |
| **Deploy to Vercel + Playwright live verify (749 cards, 0 errors)** | ✅ **Done** | 2026-08-02 |

## What's pending

None — milestone complete.

## What's queued

- [x] Git init + first commit (`bd2b5f0`) — push kept local per user choice
- [ ] Refine `other` genre (258/744 ≈ 35% of fresh finds) — future polish, not a blocker

## Live data

- **Site:** https://oss-signal.vercel.app (pivot live)
- **Data last refreshed:** 2026-08-02 (Fresh Finds: 744 repos)
- **Watchlist count:** 35 apps
- **Fresh finds count:** 744 repos

## Known issues

- `other` genre is 258/744 (~35%) — classifier could be refined later
- `scoring.ts` doesn't exist as a separate file in repo (weights are inline in refresh-data.mjs)
