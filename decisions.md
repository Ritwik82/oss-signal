# OSS Signal — Decisions Log

Every architectural choice and why. Updated when decisions are made. Newest at top.

---

## Modern Calibration reskin (2026-08-04)

Complete visual overhaul — "Modern Calibration": dark-first minimal data instrument with
glass surfaces, teal/magenta accent, serif section display. Replaces the Renaissance
Edition look (painting hero, gold-on-ink, calibration marks were kept as a motif only).

| # | Decision | Rationale |
|---|----------|-------------|
| 57 | New token palette: `#0A0A0A` bg / `#121212` surface / teal `#00F5D4` accent / magenta `#FF2D95` alerts / `#E0E0E0` text / `#A0A0A0` muted | User-driven redesign ("Modern Calibration"); teal-on-near-black ≈ 15:1, muted `#A0A0A0` passes AA (the draft's `#555` failed at 2.7:1) |
| 58 | Legacy palette aliases (`--bone`, `--gold`, `--sage`, `--terracotta`, `--dusty-blue`, `--ink`) remapped onto the new palette | Components reference them directly; remap rather than churn every component. Hero swash, status bar, needs-attention label all go teal/magenta automatically |
| 59 | Glass surfaces via `.glass` utility (rgba white ~5% + blur(8px) + hairline border) + a fixed `.aurora` ambient layer | Glass over flat black renderseels invisible; aurora (two soft teal/magenta radial gradients) gives blur something to catch |
| 60 | Hero painting replaced by inline SVG circuit-board art; `hero-sky.webp` (310KB) deleted; OG/twitter images dropped | SVG is ~2KB, theme-aware (CSS vars), no remotePatterns work; a pure look change |
| 61 | Signature motion: right-edge scroll tracker (2px teal, `useSpring(scrollYProgress)`), hero sweep hairline (`@keyframes`), View Transitions crossfade, card `whileInView` reveals | "Calibrating instrument" language; all gated by `prefers-reduced-motion` (tracker doesn't render, sweep/no animations off) |
| 62 | Left rail → icon-only buttons with hover/focus tooltips (`aria-label="II — Watchlist"`), numerals kept | Old 0.5rem *vertical* rail labels were unreadable; icons + tooltip fix it with no content loss |
| 63 | Mobile: top-nav section links collapse into a hamburger drawer (framer `AnimatePresence`); theme toggle moved into top bar (ghost button); search stays hidden `<sm` | Phone width previously overflowed; nav features preserved, search was already `<sm`-hidden |
| 64 | Archive renders as compact glass rows (44px, 24/page); per-row signal breakdown removed (detail lives on project page) | 744 specimens scan faster as rows; cards stay for Watchlist/Fresh discovery (mockup-v2 §4 intended rows) |
| 65 | Fresh Finds cards: 10px score bar with `X/10` label beside, "Copy Obtainium link" button (clipboard + toast), "Xd ago" chip from `last_release_at`, cards link to internal `/project/[...]` instead of GitHub | Ships flagship actions that were specced but never landed (decision #36/#39/#14); internal links keep the section in the app |
| 66 | Watchlist/Fresh/Archive badges pulse once on mount (`@keyframes badge-pulse`, disabled under reduced-motion) | Life without distraction; one-shot, not looping |

Per-task verification notes are in `progress.md`. Visual verification per AGENTS.md DoD
(via Playwright, values pasted) will be logged there too.

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

## Mockup v2 review (2026-08-03)

| # | Decision | Rationale |
|---|----------|-------------|
| 33 | Mockup v2 (`mockup-v2.md`) supersedes the v1 template brief | v1 was a generic SaaS template (accounts/comments/carousel) contradicting #21 (no DB) and #13 (not public) and clashing with `design.md`; v2 keeps the personal-instrument stance |
| 34 | Score breakdown is one shared modal reachable from hero + every card + methodology | Transparency is the product; footer-only placement hid it |
| 35 | Remove all hover-only interactions (flip/tilt/carousel) | a11y-hostile (no touch/keyboard path) and off the Renaissance motion language |
| 36 | "Add to Watchlist" CTA becomes "Copy import" (Obtainium URL) | No backend; copying an import URL is the honest single-user action |
| 37 | Daily greeting is fact-based + time-aware ("daily briefing"), not "awaiting your review" | The queue copy promised a review workflow that doesn't exist |
| 38 | Watchlist status-ordered with "Needs attention" group first | Abandonment risk is the #1 pain point (#6) — must lead the surface, not be a badge |
| 39 | "Copy import" renamed "Copy Obtainium link" + success toast | External review (Hermes): label the real action; per-repo URL, clipboard + toast confirm |
| 40 | Score bar: track ≥10px, honest proportional fill with tiny visible floor, number always beside it | Low-vision review point; rejected the literal "20% of card width" floor — it would misrepresent a 5/100 score |
| 41 | "How is a score made?" opens the shared score modal from the top bar | Transparency at a glance (rule 2); same modal component as cards and methodology |
| 42 | Briefing shows exact date + time-aware salutation; dismiss is prominent + keyboard-accessible; pin persists across sessions | Once-per-day control needs clear, persistent affordances |
| 43 | Rejected: vibration cue on copy; toast + focus feedback only | Vibration is Android-only gimmick with no cross-platform value |
| 44 | Pin/unpin confirm via the same toast component | A state change with no feedback reads as a dead button |
| 45 | Score modal shows weights + data-source URLs + *why* each threshold was chosen | Transparency without the reasoning is still a black box; the choice (<90d vs ≥90d) is method, not magic |
| 46 | State colors are semantic tokens (`--success/--warn/--danger`), never raw hex in components | Theme changes must not silently break contrast ratios |
| 47 | WCAG AA is the contract: contrast tokens tuned to ≥4.5:1 in BOTH themes, verified by axe script | Axe found real fails at launch (dim 3.0:1, gold-on-cream 2.87:1); tokens are the enforcement point, not per-element tweaks |
| 48 | The a11y audit script is the contrast gate (Home + Project + skip-link, both themes via `--light`) | One command re-checks after any token/layout change; caught a theme-race the manual probe missed |
| 49 | Score modal = context provider + hook (`useScoreModal`), mounted once in `page.tsx` | Openers in hero, nav, and methodology all call the same hook; no prop-drilling through server components |
| 50 | Signal data lives in one exported `signals` array (`scoring-section.tsx`), enriched with `source` + `why` per signal | Modal and methodology section render the SAME data; a weight change edits one array, not two |

## Mockup v2 review (2026-08-03, continued)

| # | Decision | Rationale |
|---|----------|-------------|
| 51 | Genre keywords expanded by observed cluster, enforced by `classify-only.mjs` re-run | `other` 35%→12.2%; the offline script makes keyword iteration a seconds-long data pass, not a 40-min API refresh |
| 52 | Genre keyword collisions (substring-in-keyword) checked on every keyword addition | `board` ⊂ `keyboard`/`dashboard` silently misclassified 12 apps; a grep pass on new vs existing keywords is the cheap gate |
| 53 | SEO base URL via `NEXT_PUBLIC_SITE_URL` env, falling back to Vercel URL | Deploy-agnostic metadata; switching to a custom domain later = one env var, no code change |
| 54 | `check-live.mjs` stays the deploy gate and now covers the new surface (modal, exports, robots, sitemap) | Post-deploy verification must check the whole overhaul, not just the 3-zone layout; 17 checks, all green locally |
| 55 | Deploy via Vercel CLI (`vercel --prod`), not git push | Repo stays local (decision #13); the CLI deploy is aliased to the production domain and needs no remote. Lifted #13 for deployment only |
| 56 | Global search in the top bar (prototype → shipped); watchlist tabs rejected | Hermes's static prototype had 3 extras: sort (already shipped), watchlist tabs (rejected — needs-attention grouping already leads), global search (shipped — searching 744 apps should not require expanding the archive). Every new idea from an external prototype gets a yes/no/maybe against the shipped app, never blanket adoption |

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
