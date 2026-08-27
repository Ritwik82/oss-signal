// Design tokens — single source for Tailwind/CSS + JS (brand, ui-styling, design-system)
// Keep globals.css as output; this file is the contract for JS/TS usage.
export const tokens = {
  accent: "var(--color-accent)",
  accentDim: "var(--color-accent-dim)",
  accentBorder: "var(--color-accent-border)",
  signal: {
    green: "var(--color-signal-green)",
    blue: "var(--color-signal-blue)",
    purple: "var(--color-signal-purple)",
    amber: "var(--color-signal-amber)",
    orange: "var(--color-signal-orange)",
    red: "var(--color-signal-red)",
  },
  surface: "var(--color-surface)",
  border: "var(--color-border)",
  text: "var(--color-text)",
  textDim: "var(--color-text-dim)",
  ruled: "var(--color-ruled)",
} as const;
export type Token = typeof tokens;
