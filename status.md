# OSS Signal — Project Status

**Last updated:** 2026-08-04

---

## Current state

**Overhaul complete (Sprints 0–7), Modern Calibration reskin, AND deployed.** Personal
FOSS Android app dashboard: Watchlist (35 apps, needs-attention-first), Fresh Finds
(744 F-Droid repos), Archive (filterable catalog), daily briefing, global search, shared
score modal, data exports, WCAG AA a11y, SEO metadata. Live at
**https://oss-signal.vercel.app** — verified 19/19 check-live + axe 0 violations both
themes (audit made deterministic via reduced-motion emulation).

## What's done

| Item | Status | Date |
|------|--------|------|
| Genre taxonomy (`data/genres.json`) | ✅ Done | 2026-08-02 |
| Watchlist seed (`data/watchlist.json` — 35 apps) | ✅ Done | 2026-08-02 |
| Data layer update (`src/lib/data.ts`) | ✅ Done | 2026-08-02 |
| Two-pipeline refresh script (`scripts/refresh-data.mjs`) | ✅ Done | 2026-08-02 |
| Offline genre re-classifier (`scripts/classify-only.mjs`) | ✅ Done | 2026-08-03 |
| Genre classifier refinement (`other` 35% → 12.2%) | ✅ Done | 2026-08-03 |
| Renaissance visual pass (Sprint 1) | ✅ Done | 2026-08-03 |
| Daily briefing + watchlist regrouping (Sprint 2) | ✅ Done | 2026-08-03 |
| WCAG AA audit script + contrast fixes, both themes (Sprint 3) | ✅ Done | 2026-08-03 |
| Shared score modal (Sprint 4a) | ✅ Done | 2026-08-03 |
| Export buttons — watchlist JSON/CSV + projects JSON (Sprint 4b) | ✅ Done | 2026-08-03 |
| Global search (top bar combobox) | ✅ Done | 2026-08-03 |
| SEO: robots.txt, sitemap.xml, OG/Twitter metadata (Sprint 6) | ✅ Done | 2026-08-03 |
| Modern Calibration reskin (whole-site visual overhaul) | ✅ Done | 2026-08-04 |
| `tsc --noEmit` — zero errors | ✅ Done | 2026-08-04 |
| `npm run build` — clean build, all routes prerender | ✅ Done | 2026-08-04 |
| **DEPLOY: reskin live on Vercel (CLI deploy, aliased)** | ✅ **Done** | 2026-08-04 |
| Live verify: `check-live.mjs` 19/19 + a11y both themes (Live URL) | ✅ Done | 2026-08-04 |
| a11y-audit made deterministic (reduced-motion emulation) | ✅ Done | 2026-08-04 |

## What's pending

Nothing — all queued items are explicit opt-ins/deferrals below.

## What's queued

- [x] Git init + first commit — push kept local per user choice
- [x] Refine `other` genre (was 258/744 ≈ 35%) — now 91/744 ≈ 12.2%
- [ ] Opt-in Vercel Analytics (only if user wants; no third-party by default)
- [ ] First user-survey (one question, not a form) after deploy
- [ ] `userscript/` (Phase 6 `/api/score/[owner]/[repo]`) — deferred (decision #22)
- [ ] Orphaned `src/app/api/tracked` + `src/app/api/updates` routes (no callers, deployed
      but unused; KV-dependent) — wire up or delete

## Live data

- **Site:** https://oss-signal.vercel.app (Modern Calibration LIVE, verified 2026-08-04)
- **Data last refreshed:** 2026-08-02 (Fresh Finds: 744 repos)
- **Watchlist count:** 35 apps
- **Fresh finds count:** 744 repos

## Known issues

- `scoring.ts` doesn't exist as a separate file in repo (weights are inline in
  refresh-data.mjs + shared `signals` array in scoring-section.tsx)
- Lint: 7 pre-existing `react-hooks/*` errors in committed files (same hydration-gate
  idiom across the codebase); build + tsc + axe all clean
- `src/app/api/tracked`/`updates` deployed but unreferenced by any component — flagged
  above for wire-up-or-delete
