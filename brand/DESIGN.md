---
name: "OSS Signal — FOSS Android app health dashboard"
category: Brands
surface: web
colors:
  background: "#0a0a0a"
  surface: "#121212"
  foreground: "#e0e0e0"
  muted: "#a0a0a0"
  border: "#232323"
  accent: "#00f5d4"
  accent-secondary: "#ff2d95"
---

# OSS Signal — FOSS Android app health dashboard

> Category: Brands

> Surface: web

*Apps you rely on*

Prioritize actively maintained FOSS Android apps. Track the ones you rely on and discover the ones worth installing — every score is built from six transparent health signals.

## Color Palette

| Role | Name | Hex | Usage |
| --- | --- | --- | --- |
| background | Background | `#0a0a0a` | page canvas — measured --color-bg (dark) |
| surface | Surface | `#121212` | cards / raised surfaces — measured --color-surface (dark) |
| foreground | Foreground | `#e0e0e0` | body text — measured --color-text / bone |
| muted | Muted | `#a0a0a0` | secondary text — measured --color-text-muted |
| border | Border | `#232323` | hairlines / dividers — measured --color-border |
| accent | Accent | `#00f5d4` | primary brand color — waveform, live status dot, active tags (measured --color-accent) |
| accent-secondary | Accent secondary | `#ff2d95` | alerts, warnings, and abandonment-risk indicators — measured --color-accent-magenta (dark #ff2d95, light #c2185b) |

## Typography
- **Display:** Playfair Display — weights 400, 700 — fallbacks: Georgia, Times New Roman, serif
- **Body:** Space Grotesk — weights 400, 500, 600, 700 — fallbacks: system-ui, -apple-system, Segoe UI, Helvetica Neue, Arial, sans-serif
- **Mono:** JetBrains Mono — weights 400, 500, 700 — fallbacks: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace

## Voice & Tone

- **Adjectives:** technical, mechanical, calm, signal-forward, precise
- **Tone:** An operations console: technical, mechanical, calm. Status lines are short, declarative, and datapoint-forward — the UI speaks like a well-calibrated instrument quietly confirming what is healthy and flagging what is not. Zero hype, zero affect. Slogans such as 'Six signals. One honest score.' and 'No black boxes.' and lines like 'Stale apps don't get to ride on momentum' set the register.

### Messaging pillars
- Apps you rely on
- New & actively maintained
- Everything we're tracking

### Vocabulary
- **Use:** signal, score, watchlist, fresh finds, archive, recency, momentum, issue health, contributors, license, abandonment risk, active, maintained, abandoned, warning, calibration, system active, status, telemetry, nominal, online
- **Avoid:** hype superlatives, app-store marketing speak, vague praise, invented metrics, safety or endorsement claims, decorative emoji

## Imagery

- **Style:** Typographic, icon-led near-black glass UI — the site carries no photographic or illustrative hero art. The brand is drawn with type, 1px rules, frosted glass panels, an accent waveform mark, and 6px signal dots.
- **Subjects:** app-health cards, oscilloscope waveform, signal dots, mono data labels, frosted glass panels
- **Treatment:** 8px-blur glass with 1px white-alpha borders, 8px corner radius, accent L-corners on cards, 8–10px uppercase mono micro-labels, dark-first with a light mode.
- **Avoid:** photography, illustration, emoji as icons, decorative screenshots, hero imagery

## Layout

- **Radius:** 8px
- **Border weight:** 1px
- **Spacing:** 8px baseline grid (site uses Tailwind's 4px unit scale — 8/16/32px rhythms)

### Posture rules
- Sticky 40px top nav: frosted glass (bg 82% + 8px blur), 1px bottom hairline, accent pulse line animating across its lower edge
- Fixed 3.5rem left rail of 40px square section icons labeled I–IV (Watchlist, Fresh Finds, Archive, Method)
- max-w-7xl (80rem) content column with 1rem page padding
- Cards: glass fill (white 4%), 1px white-alpha border, 0 8px 24px black 25% shadow, 8px radius, 1rem padding, 2px accent L-corners on the top-left and bottom-right (corner-mark motif)
- Uppercase JetBrains Mono micro-labels at 8–10px with tracking-widest for tags, statuses, and versions (monospace system labels)
- Status communicated by 6px rounded signal dots: green (fresh), red/magenta (abandoned), orange (warning), blue (info), purple, pink
- Circuit-board hero: a low-density schematic trace — the accent waveform line with node dots — spans the hero region on the near-black canvas, echoing the nav pulse line
- Magenta is reserved for alerts and abandonment-risk indicators; it never appears on neutral chrome or healthy-state UI
- Hover raises card border to accent-border; focus-visible shows a 2px accent outline with 2px offset
- Fade/rise entrance: cards start at 8px translate with blur-on-opacity view transitions
- Dark is the default theme; a .dark class toggle switches to a near-white variant with the same roles
