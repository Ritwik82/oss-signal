# OSS Signal — Brand Guide

*Apps you rely on*

**OSS Signal** is a health dashboard for FOSS Android apps. It prioritizes actively maintained open-source apps, tracks the ones you rely on, and surfaces the ones worth installing — every score is built from six transparent health signals. Source: https://oss-signal.vercel.app/

> All values in this guide were **measured from the site's own CSS** (`:root` custom properties, `@font-face` declarations, and computed component styles). Values are labeled `inferred` where the site left them implicit.

---

## Color

Dark is the default theme; a `.dark` class toggles a near-white variant of the same roles.

### Core roles (dark / default)

| Role | Hex | OKLCH | Measured from | Usage |
| --- | --- | --- | --- | --- |
| background | `#0a0a0a` | `oklch(0.1448 0 0)` | `--color-bg` | page canvas |
| surface | `#121212` | `oklch(0.1822 0 0)` | `--color-surface` | cards / raised surfaces |
| foreground | `#e0e0e0` | `oklch(0.9067 0 0)` | `--color-text` (bone) | body + heading text |
| muted | `#a0a0a0` | `oklch(0.7058 0 0)` | `--color-text-muted` | secondary text |
| border | `#232323` | `oklch(0.2562 0 0)` | `--color-border` | hairlines / dividers |
| accent | `#00f5d4` | `oklch(0.8681 0.1595 178.2)` | `--color-accent` | waveform, live dot, active tags |
| accent-secondary | `#ff2d95` | `oklch(0.6655 0.2492 357.34)` | `--color-accent-magenta` | alerts, warnings, abandonment-risk indicators |

### Derived dark tokens (also measured)

- `--color-surface-hover: #1a1a1a`, `--color-border-hover: #333`
- `--color-text-dim: #8a8a8a` — tertiary data labels
- `--color-accent-dim: #00f5d414` — accent chip fill; `--color-accent-border: #00f5d447` — accent chip border
- `--color-paper: #101010`, `--color-ink: #d0d0d0`, `--color-ruled: #1e1e1e`, `--color-margin: #2e2e2e`
- Glass: `--glass-bg: #ffffff0a` (white 4%), `--glass-border: #ffffff14` (white 8%), `--color-hero-scrim: #0a0a0a9e`
- Signal status dots: green `#00e0b8` (fresh), red/magenta `#ff2d95` (abandoned), blue `#7dd3fc` (info), purple `#c084fc`, orange `#fb923c` (warning), pink `#f472b6`

### Light mode (`:root:not(.dark)`)

bg `#fafafa`, surface `#fff`, border `#e3e3e3`, text `#1a1a1a`, muted `#555`, dim `#6f6f6f`; accent `#00796b`, accent-magenta `#c2185b`, accent-dim `#00796b14`, accent-border `#00796b40`; signals green `#0e8a62`, blue `#2563eb`, red `#c2185b`.

**Rules of use**
- The accent is a high-signal color — use it sparingly (waveform, live dot, one active tag per card), never as a large wash.
- **Magenta (`accent-secondary`) is reserved for alerts and abandonment-risk indicators** — dark `#ff2d95`, light `#c2185b`. It never appears on neutral chrome or healthy-state UI.
- Status is encoded by the 6px signal dots plus a mono uppercase label; never rely on color alone (accompany with text).

---

## Typography

Three families, measured from `@font-face` + `font-family` usage frequencies. All three are on Google Fonts (provenance recorded in `brand.json`).

| Role | Family | Weights | Measured usage | Fallbacks |
| --- | --- | --- | --- | --- |
| Display | Playfair Display | 400, 700 (+italics) | `--font-serif`, `.serif-display` headings | Georgia, "Times New Roman", serif |
| Body | Space Grotesk | 400, 500, 600, 700 | `--font-display` → `--font-sans` | system-ui, -apple-system, Segoe UI, Helvetica Neue, Arial, sans-serif |
| Mono | JetBrains Mono | 400, 500, 700 | `--font-mono` labels, tags, versions | SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace |

**Micro-label system (the signature move)**
- Tags, statuses, versions, repo paths, and nav items are JetBrains Mono **uppercase**, **8–10px**, `tracking-widest` (`0.1em`).
- App names are Space Grotesk 600, `tracking-tight`; big section headings are Playfair Display bold with `letter-spacing: -0.01em` and a soft `0 1px 8px #00000073` text shadow.

**Weights used in practice** — Space Grotesk 400 (body), 600 (card titles), 500/600 (buttons); JetBrains Mono 400 (labels), 700 (wordmark).

---

## Logo

- **Primary:** `logos/wordmark-lockup.svg` — the header lockup: accent oscilloscope waveform (path `M0 6h4l2-4 3 8 3-12 3 10 2-4h7`, stroke-width 1.6) + **OSS SIGNAL** in JetBrains Mono 700, `tracking-widest`.
- **Alternates:** `logos/wordmark-wave.svg` (bare waveform mark), `logos/favicon-1.ico` (256px favicon), `logos/header-inline.svg` (watchlist eye glyph from the fixed left rail).
- The wordmark is always set on near-black; the waveform may adopt the accent color alone on lighter surfaces.

---

## Voice & tone

An operations console: technical, mechanical, calm. Status lines are short, declarative, and datapoint-forward — the UI speaks like a well-calibrated instrument quietly confirming what is healthy and flagging what is not. Zero hype, zero affect.

- **Signatures:** "Six signals. One honest score." · "No black boxes." · "Never install abandonware again." · "Stale apps don't get to ride on momentum."
- **Adjectives:** technical, mechanical, calm, signal-forward, precise.
- **Messaging pillars:** Apps you rely on · New & actively maintained · Everything we're tracking.

**Use** — signal, score, watchlist, fresh finds, archive, recency, momentum, issue health, contributors, license, abandonment risk, active, maintained, abandoned, warning, calibration, system active, status, telemetry, nominal, online.

**Avoid** — hype superlatives, app-store marketing speak, vague praise, invented metrics, safety/endorsement claims, decorative emoji.

---

## Imagery

The site carries **no photographic or illustrative hero art** — it is typographic and icon-led. The brand is drawn with type, 1px rules, frosted glass panels, the accent waveform, and 6px signal dots.

- **Style:** Near-black glass UI; glass = white 4% fill + 8px backdrop blur + 1px white 8% border.
- **Subjects:** app-health cards, oscilloscope waveform, signal dots, mono data labels, glass panels.
- **Avoid:** photography, illustration, emoji as icons, decorative screenshots, hero imagery.
- Preserved capture: `imagery/oss-signal-full-site.png` (full-page screenshot of the dashboard, 1600×5909).

---

## Layout posture

- **Radius 8px** · **1px borders** · **8px baseline grid** (Tailwind 4px unit scale — 8/16/32px rhythms).
- Sticky **40px** top nav: frosted glass (bg 82% + 8px blur), 1px bottom hairline, accent pulse line riding its lower edge.
- Fixed **3.5rem left rail** of 40px square section icons labeled I–IV (Watchlist, Fresh Finds, Archive, Method).
- Content column `max-w-7xl` (80rem), 1rem page padding.
- **Corner-mark cards:** glass fill, 1px alpha border, `0 8px 24px rgba(0,0,0,0.25)` shadow, 1rem padding, and **2px accent L-corners** on the top-left + bottom-right of each card.
- **Monospace system labels:** every tag, status, version, and nav item is uppercase JetBrains Mono at 8–10px, `tracking-widest`.
- **Circuit-board hero:** a low-density schematic trace — the accent waveform line with node dots — spans the hero region on the near-black canvas, echoing the nav pulse line.
- Magenta (`accent-secondary`) appears only on alerts and abandonment-risk indicators, never on neutral chrome or healthy-state UI.
- Hover raises card border to accent-border; `:focus-visible` gets a 2px accent outline with 2px offset.
- Cards enter with fade/rise (8px translate) and blur-opacity view transitions (~0.15–0.4s; site defines `--duration-exit .15s`, `--duration-enter .21s`, `--duration-move .4s`).

---

## Method (context for scoring UI)

Six weighted signals combine into a 1–10 score: Recency (0.24), Momentum (0.20), Abandonment Risk ↓ (0.20, inverted), Issue Health (0.16), Contributors (0.12), License (0.08). `score = Σ(signal × weight) × 10`, clamped to [0, 10]. Use this vocabulary when building scoring or health displays.
