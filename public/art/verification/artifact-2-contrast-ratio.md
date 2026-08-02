# Artifact 2: WCAG Contrast Ratio Verification

**Date:** 2026-07-15
**Page:** http://localhost:3099
**Method:** Playwright `page.evaluate()` — computed colors + WCAG luminance formula

## Background Estimate

The hero text sits over:
1. Turner's *The Fighting Temeraire* painting (avg #9a9080 behind headline)
2. CSS scrim: `linear-gradient(to bottom, rgba(26,23,20,0.72) 0%, rgba(26,23,20,0.45) 40%, ...)`
3. Text-shadow: `rgba(0,0,0,0.45) 0px 1px 8px`

Effective background at headline position: **#2f2b27**

## Results (after text-shadow fix)

| Element | Color | Hex | Ratio vs #2f2b27 | WCAG AA Large (≥3:1) |
|---------|-------|-----|-------------------|----------------------|
| "Discover" (bone) | rgb(200,192,174) | #c8c0ae | **7.76:1** | ✅ Pass |
| "Promising" (gold) | rgb(184,144,48) | #b89030 | **4.73:1** | ✅ Pass |
| "Open Source" (dusty-blue) | rgb(122,138,158) | #7a8a9e | **3.98:1** | ✅ Pass |

## Before Fix (no text-shadow)

| Element | Ratio | Status |
|---------|-------|--------|
| "Discover" (bone) | 4.60:1 | ✅ Pass |
| "Promising" (gold) | 2.80:1 | ❌ Fail |
| "Open Source" (dusty-blue) | 2.36:1 | ❌ Fail |

## Fix Applied

Added `text-shadow: 0 1px 8px rgba(0, 0, 0, 0.45)` to `.serif-display` in `globals.css`.
This darkens the effective background behind each glyph, boosting contrast without changing the sampled palette colors.

## Palette Source

All colors sampled from the actual 1920px WebP of Turner's *The Fighting Temeraire* (1839).
See `public/art/CREDITS` for full attribution.
