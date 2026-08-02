# OSS Signal — Audit & Fix Handoff

**Date:** 2026-07-15
**Deployed:** https://oss-signal.vercel.app

---

## Confirmed Bugs Fixed

### 1. Footer DOM position
**Status:** Already correct in codebase. Footer sits outside the archive section in `page.tsx` (line 82+), after the `</section>` closing tag (line 79). No interleaving with specimen grid.

### 2. Three disagreeing timestamps
**Fix:** Unified all three timestamp displays to use `<RelativeTime>` computed from `data.generated_at`:
- Hero: replaced static "Updated every 6h" → "Last refresh: {relative time}"
- Archive: was already using `<RelativeTime>` ✓
- Footer: replaced `toLocaleString()` → `<RelativeTime>`
- Hero also now receives `projectCount` prop instead of hard-coded "62"

### 3. Default sort order inverted
**Root cause:** Sort comparison `dir * (b.score - a.score)` with `dir = -1` produced `a.score - b.score` (ascending). All three sort comparisons (score, stars, newest) were inverted.
**Fix:** Changed all comparisons from `b - a` to `a - b` so `dir = -1` correctly produces descending order.

### 4. Null language renders as "N/A"
**Fix:**
- Changed fallback from `"N/A"` to `"Mixed"` in specimen cards
- Featured section already omits chip when language is null ✓
- Language filter now works correctly — projects with null language show under "ALL" and are excluded from specific language filters (correct behavior)

### 5. Specimen IDs rank-based not stable
**Fix:**
- Added `owner/repo` as stable identifier display alongside cosmetic SP-### in all card components (project-grid, featured-section)
- Project detail page now shows `owner/repo` instead of SP-### as primary identifier
- SP-### retained as cosmetic display-order indicator only
- All hrefs already use `project.id` (owner/repo) — no lookup key changes needed

### 6. CN toggle label ambiguous
**Fix:** Changed from "On"/"Off" to "Showing"/"Hidden" with proper `aria-label` ("CJK projects visible" / "CJK projects hidden").

---

## Features Implemented

### 7. Additional sort options
Added three new sort fields: **Recency**, **Issue Health**, **License** — all weighted signals that were previously only visible in the score breakdown. Sort direction chips now show "↓ High→Low" / "↑ Low→High" labels.

### 8. Search box QA
Verified: `type="search"` provides native clear button, `startTransition` makes filtering non-blocking, empty state shows "No specimens match your criteria" with guidance. No debounce needed for 62 items.

### 9. Per-project score breakdown in cards
Added expand/collapse panel to specimen cards showing all 5 signal values with color-coded dots. Click "Signals" to expand, click again to collapse. Keyboard accessible with `aria-expanded`, `role="button"`, and Enter/Space handlers.

### 10. Dataset size clarity
Changed results count from "{n} specimens found" to "{n} of {total} specimens shown" — makes it explicit that the full dataset is loaded.

### 11. Content moderation disclaimer
Added disclaimer in two locations:
- Archive section: "Scores are mechanical health signals (recency, momentum, issue activity, contributors, license) — not endorsements. Evaluate projects independently before adopting."
- Footer: "Scores are automated health signals, not endorsements or safety reviews. Use your own judgment."

---

## Accessibility Improvements

- Theme toggle: fixed `focus-visible` outline color from emerald to amber
- Filter chips: added `ariaLabel` prop for screen reader context
- Specimen cards: added `focus-visible:outline` for keyboard navigation
- CJK toggle: added descriptive `aria-label`
- Expand/collapse: proper `aria-expanded`, `role="button"`, keyboard handlers

---

## Files Changed

| File | Changes |
|------|---------|
| `src/components/project-grid.tsx` | Sort logic fix, null language fallback, CN toggle label, new sort options, score breakdown expand/collapse, aria-labels, dataset count |
| `src/components/hero-section.tsx` | New `lastRefresh` + `projectCount` props, RelativeTime import |
| `src/components/featured-section.tsx` | Added owner/repo stable ID, signal dots |
| `src/app/page.tsx` | Hero props, unified timestamps, disclaimer text |
| `src/app/project/[id]/page.tsx` | owner/repo as primary ID, removed unused specimenId |
| `src/components/theme-toggle.tsx` | Focus outline color fix |

---

## Verification

- ✅ `npx tsc --noEmit` — zero errors
- ✅ `npm run lint` — zero warnings
- ✅ `npm run build` — clean build
- ✅ `npx vercel --prod` — deployed to https://oss-signal.vercel.app
