## Project Purpose (updated 2026-08-02 — pivot day)

**Before this date**, OSS Signal was a generic "recent GitHub repos" list.

**Now**, it's a personal FOSS Android app dashboard:

- **Watchlist** (Zone 1) — 34 OSS apps tracked for staleness, abandonment risk, updates
- **Fresh Finds** (Zone 2) — newly launched (< 9mo) open-source Android apps scored on 6 signals
- **Archive** (Zone 3) — full catalog, collapsed by default, filterable by genre/access/timing

The design prefix `Section XX /` naming reflects this:
- `Section 01 / Your Watchlist`
- `Section 02 / Fresh Finds`
- `Section 03 / Full Archive`

Old handoff doc `HANDOFF.md`(filename preserved) pre-dates the pivot. New decisions are tracked in `decisions.md` (always update this file when making architectural choices).

---

## Agent Operating Rules

These rules override default behavior. They exist because past fixes were reported
"complete" based on the agent's own inspection, then turned out broken when checked
against the real deployed site. The footer bug passed self-review three times before a
real export caught it. The root cause was never the diagnosis — it was trusting
self-attestation instead of an external artifact. These rules close that gap.

---

## Definition of Done

A task is NOT complete until ALL of the following are true. "I inspected it and it looks
right" does not satisfy any of these. Reasoning about source code does not satisfy any of
these.

1. The bug was **reproduced before fixing** — you captured the failing state as evidence.
2. The fix is **verified against the real artifact** — the deployed URL, not your mental
   model of the code.
3. There is a **captured artifact** proving the failing case now passes (a Playwright
   screenshot/DOM read for UI, or a passing regression test for logic).
4. You have stated, explicitly, *what you checked* and *what you observed* — the actual
   value read from the live page or the test output, not a claim that it's correct.

If you cannot produce the artifact, the task is "diagnosis accepted, awaiting
verification" — NOT done. Say so plainly. Never round "probably fixed" up to "fixed."

---

## Verification Protocol

### For UI / rendering bugs → use Playwright (it is connected)
- **Before fixing:** navigate to the actual URL, capture the broken state (screenshot +
  the specific DOM property, e.g. `opacity`, `offsetParent`, computed style).
- **After fixing:** navigate to the *deployed* URL again, re-read the same property, and
  paste the observed value back. A fix is only real if the before-state was broken and the
  after-state, read from the live page, is correct.
- Never report a computed style or element property from reading the JSX. Read it from the
  rendered page via Playwright.

### For logic bugs (sorting, IDs, tie-handling, data) → write a failing test first
- Use TDD: write a test that FAILS on the current code and PASSES after the fix.
- A regression test beats a screenshot for logic — it fails on the old code, passes on the
  new, and stops silent reintroduction.
- Paste the test output (red → green), not a description of it.

---

## Reproduce Before You Fix

Half of fixing a bug is confirming you understand it. Before writing any fix:
- Reproduce the failure and capture the "before" state.
- State the root cause in one sentence (five-whys / diagnosing-bugs is good for this).
- A fix that cannot show the broken "before" state may be solving a phantom. Don't.

---

## Red-Team Your Own "It's Fixed"

Before reporting completion, run one pass of skepticism on YOUR OWN verification:
- "What would prove this is NOT fixed?" Then go check that specific thing.
- "Is my evidence from the live artifact, or from my own inspection of the code?" If the
  latter, it doesn't count — go get the artifact.
- Assume a reviewer will re-export the page and try to contradict you. Beat them to it.

---

## Record Scar Tissue

When a bug had a non-obvious root cause, append a one-line lesson to the
`## Known Patterns` section below so it isn't relearned. Read that section every session.

## Known Patterns (project-specific, learned the hard way)
- Self-reported DOM inspection has been wrong before. Confirm UI state with Playwright
  against the DEPLOYED url, never from source.
- Stale `next start` processes survive `.next` wipes and keep serving OLD build HTML from
  memory — symptoms look like app bugs (500s on chunks that don't exist on disk,
  skip-links vanishing after reload). Always check server StartTime vs BUILD_ID mtime
  (`Get-Process -Id <pid> | select StartTime` vs `(Get-Item .next/BUILD_ID).LastWriteTime`)
  before debugging "phantom" build issues; kill by PID and restart fresh. When a new
  component "isn't in the DOM", first verify the server isn't pre-build: kill by owning
  PORT (`Get-NetTCPConnection -LocalPort 3100` → OwningProcess), NOT by command-line
  substring — `*next start -p 3100*` silently misses the real cmdline (`start  -p`,
  double space) and the stale server survives to serve the old build.
- The layout `themeScript` re-applies `dark` on EVERY page load from localStorage. For
  theme tests, set `oss-signal-theme` via `context.addInitScript` BEFORE navigation —
  removing the class post-load is racy and gives flaky results.
- `display: contents` generates no box → framer-motion `whileInView` never fires → element
  stranded at `opacity: 0` (invisible but still clickable). Watch for this on animated
  wrappers with `className="contents"`.
- Absolutely-positioned children resolve against the nearest *positioned* ancestor. A
  container holding absolute corner-marks/overlays MUST have `relative`, or children escape
  to `<body>` and scatter to viewport corners.
- Featured/hero sections and the archive list are SEPARATE render paths. Verifying one does
  not verify the other. Check both.
- PDF export leaves the hero/featured region blank — use a Playwright screenshot for that
  area, not a print/PDF export.
- `data/projects.json` will NOT match the new schema until you run
  `scripts/refresh-data.mjs`. Type errors that look like Project-vs-schema mismatches are
  usually just missing fields — regenerate data before debugging components.
- Genre keyword additions are substring matches — a new keyword that is a substring of
  another word (e.g. `board` ⊂ `keyboard`, `dashboard`) silently misclassifies. After
  editing `data/genres.json`, run `node scripts/classify-only.mjs` and grep the results
  for the collision pattern (e.g. keyboard/dashboard apps landing in `media`).

---

## Working Set for This Repo

Prefer these skills; ignore the rest of the catalog to reduce noise:
`diagnosing-bugs`, `tdd`, `code-review`, `firecrawl-qa` / Playwright (live checks),
`pre-mortem` / `grill-me` (to red-team your own claims). Reach outside this set only when
the task genuinely calls for it.
