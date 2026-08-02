# OSS Signal — Decisions Log

Every architectural choice and why. Updated when decisions are made. Newest at top.

---

## Pivot decisions (2026-08-02)

| # | Decision | Rationale |
|---|----------|-------------|
| 1 | Keep OSS Signal name + Vercel/Next.js infra | You still like the project; the issue is what it surfaces, not the stack |
| 2 | Pivot from generic repos → FOSS Android apps | Actual daily problem: finding good, actively-maintained open-source Android apps is hard (komi-store limited, Orion Droid clanky filters, niche stores unreliable) |
| 3 | Watchlist = one-time seed from ObtainX export | You're the only user; you can re-export from phone when apps change |
| 4 | Watchlist tracks 34 OSS apps (TTSReader excluded) | TTSReader is Play Store-only, closed source, can't score — track version only |
| 5 | Fresh Finds window = ~9 months | Balances novelty with stability; young enough to be "fresh" but old enough to have signals |
| 6 | Abandonment risk = 6th signal at 20% weight | Your #1 pain point is stale unmaintained apps; without this signal the dashboard doesn't solve the core problem |
| 7 | Social proof (HN/Reddit) only for generic + low-star apps | Unique ideas don't need social proof; common ideas benefit from chatter. Saves API calls |
| 8 | Exclude awesome-lists/templates (awesome-*, CS-Fundamentals, etc.) | These are content collections, not installable apps — noise in Fresh Finds |
| 9 | Genre taxonomy replaces all filter chips | You called Orion's filtering "clanky"; a single genre dimension + Shizuku/Access + generic toggle is simpler |
| 10 | All 4 APK-apps (AyuGram, SpotiFLAC, Seal Plus) mapped to real GitHub repos | ObtainX defaulted to APKPure for these; actual repos found and corrected for full scoring |
| 11 | Three-zone page layout: Watchlist → Fresh Finds → Archive | Morning view surfaces what matters first (your apps) before discovery (new finds) |
| 12 | Archive collapsed by default | Watchlist + Fresh Finds are the daily surface; Archive is exploration |
| 13 | No GitHub push until deploy time | Keep working tree local; public when you decide to share |
| 14 | Fresh Finds section adds Shizuku badge + genre tag + "Updated Xd ago" chip | Most useful metadata at a glance without opening project page |
| 15 | getGenres/getWatchlist/getProjects as server-only functions | Client components receive data as props, avoiding fs-boundary issues |

## Scoring mechanics

| # | Decision | Rationale |
|---|----------|-------------|
| 16 | Existing 5 signals (recency, momentum, issue_health, license, contributors) scaled ×0.80 | Preserve existing scoring model while adding abandonment_risk |
| 17 | Abandonment risk thresholds: <14d=fresh / <30d=warning / <90d=stale / ≥90d=abandoned | Balanced — too strict (<7d) would false-positive on release cadence; too loose (>180d) misses the signal |
| 18 | Momentum normalized against run's max raw | Consistent relative ordering within a batch, not absolute across time |
| 19 | Social mentions counted, not linked directly | Keep data shape small; count + link list both useful |
| 20 | Issue health defaults to 0.5 for repos with <5 recent issues | Avoid penalizing new/low-traffic repos with thin issue data |

---

## Non-code decisions

| # | Decision | Rationale |
|---|----------|-------------|
| 21 | Data lives in committed JSON, not a database | $0 forever on Vercel Hobby; no DB to manage |
| 22 | Userscript (Phase 6, `/api/score/[owner]/[repo]`) deferred | Get the dashboard right first |
| 23 | 4 doc files (README, status, progress, decisions) | Keeps project context preserved across sessions; prevents re-explaining on next visit |

---

## Post-pivot decisions (2026-08-02, deploy day)

| # | Decision | Rationale |
|---|----------|-------------|
| 24 | Fresh Finds source = F-Droid `index-v2.json` (not GitHub search) | GitHub search in the 9-month window returned 0 Android candidates (agent/AI skill repos flooded it). F-Droid has every app + exact `metadata.added` timestamp, no rate limits |
| 25 | F-Droid index cached to disk 12h (`.cache/`, gitignored) | 52MB download on flaky network; cache makes re-runs fast and network-safe |
| 26 | All fetches go through one `retryFetch` (timeout + backoff, retries ECONNRESET/ENOTFOUND/ETIMEDOUT/ABORT_ERR/5xx) | One flaky-DNS failure was killing the whole run via `Promise.all`; contributor failures degrade to 0 instead of crashing |
| 27 | Fresh Finds scored in batches of 5 with progress logs | 811 repos sequentially took ~40 min and looked stuck; batches + per-request timeouts cut wall time and make progress visible |
| 28 | Dedupe repos by id keeping highest score (768 → 744) | Same GitHub repo ships via multiple F-Droid packages (e.g. Modern-Apps ×22) causing duplicate React keys |
| 29 | Project page route `[id]` → `[...id]` catch-all | New ids are `owner/repo` (contain `/`); single-segment dynamic route 404s on encoded slashes |
| 30 | RelativeTime + "New" badge compute after mount, not in render | `Date.now()` in a `useState` initializer / render caused React #418 hydration mismatch on prod (server/client drift) |
| 31 | `--fresh-only` / `--watchlist-only` pipeline flags | Watchlist data is valid for days; iterating on Fresh Finds shouldn't re-fetch 35 GitHub repos every time |
| 32 | Dedupe note: 24 of 768 dropped as duplicate packages | keeps 744 unique apps; acceptable loss since they're the same repo |

---

*This log is authoritative. When in doubt, check here before re-litigating a decision.*
