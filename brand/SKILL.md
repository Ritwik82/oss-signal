---
name: oss-signal-design-system
description: Apply the OSS Signal brand — near-black glass UI, teal waveform accent, warm amber abandonment signal, serif headings, sans body, mono micro-labels, corner-mark cards — to any new design.
user-invocable: true
---

# OSS Signal Design System

## What is inside

A complete, measured brand package for **OSS Signal — FOSS Android app health dashboard** (https://oss-signal.vercel.app/): color tokens with OKLCH, a three-face type system (Playfair Display / Space Grotesk / JetBrains Mono), the waveform wordmark lockup, voice & tone guidance, imagery rules, layout posture, and a six-artifact design-system kit.

## Source context

- Source URL: https://oss-signal.vercel.app/
- All tokens measured from the site's own CSS — see `brand.json` for provenance and exact `:root` variable names.
- Registered design system id: `user:oss-signal-vercel-app`. Brand extraction id: `oss-signal-f3cef3`.
- The site is typographic and icon-led — it carries no raster imagery; do not invent photo/illustration assets for this brand.

## When to use this skill

Use whenever a deliverable targets the OSS Signal brand, or any near-black glass / data-dashboard product UI that wants this visual language: landing pages, dashboards, decks, posters, emails, newsletters, forms.

## How to use

1. Read `DESIGN.md` for the canonical rules, then `BRAND.md` for the full prose guide.
2. Pull exact values from `brand.json` (hex + OKLCH colors, `googleFontsUrl` per family).
3. Reference preserved assets with relative paths from `logos/` (`wordmark-lockup.svg` is the primary logo) and `imagery/`.
4. Bind the palette to your CSS `:root`; ship the declared fallback stacks when a face is not web-loadable.
5. Follow the layout posture: 8px radius, 1px borders, 8px baseline grid, glass cards (white 4% fill + 8px blur + 1px white 8% border), 2px accent L-corners, 8–10px uppercase mono micro-labels, circuit-board hero, one accent per viewport; reserve warm amber for alerts and abandonment-risk indicators.
6. Write in the operations-console voice: technical, mechanical, calm — short declarative status lines, zero hype.
7. Reuse or extend the generated `system/artifacts/*` examples when building new deliverables.

## Design system highlights

- **Palette (dark default):** bg `#0a0a0a`, surface `#121212`, fg `#e0e0e0`, muted `#a0a0a0`, border `#232323`, accent `#00f5d4` (use sparingly), accent-secondary `#ff9f43` (alerts + abandonment risk; light `#b45309`).
- **Type:** Playfair Display (display), Space Grotesk (body), JetBrains Mono (labels) — three distinct faces is the signature.
- **Voice:** technical, mechanical, calm — an operations console; short declarative status lines, zero hype ("Six signals. One honest score.").
- **Imagery:** none — typographic, icon-led; status via 6px signal dots + mono uppercase labels, never color alone.
- **Layout:** 40px sticky glass nav, fixed left rail (I–IV), corner-mark glass cards, monospace system labels, circuit-board hero, fade/rise entrances, dark-first with light-mode variant.
