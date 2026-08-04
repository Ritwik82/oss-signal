"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "watchlist", numeral: "I", label: "Watchlist", icon: "eye" },
  { id: "fresh-finds", numeral: "II", label: "Fresh Finds", icon: "sparkle" },
  { id: "archive", numeral: "III", label: "Archive", icon: "archive" },
  { id: "methodology", numeral: "IV", label: "Method", icon: "ruler" },
] as const;

const icons: Record<string, React.ReactNode> = {
  waveform: (
    <svg className="left-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12h3l2-5 3 9 3-12 3 10 2-4h4" />
    </svg>
  ),
  eye: (
    <svg className="left-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  sparkle: (
    <svg className="left-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
    </svg>
  ),
  archive: (
    <svg className="left-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  ),
  ruler: (
    <svg className="left-rail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="9" width="20" height="6" rx="1" />
      <path d="M6 9v3M10 9v3M14 9v3M18 9v3" />
    </svg>
  ),
};

export function LeftRail() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (!el) continue;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActive(section.id);
            }
          }
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    }

    return () => {
      for (const obs of observers) obs.disconnect();
    };
  }, []);

  return (
    <nav className="left-rail" aria-label="Section navigation">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="left-rail-link"
          style={{
            color:
              active === s.id ? "var(--color-accent)" : undefined,
            borderColor:
              active === s.id ? "var(--color-accent-border)" : undefined,
            backgroundColor:
              active === s.id ? "var(--color-accent-dim)" : undefined,
          }}
          aria-label={`${s.numeral} — ${s.label}`}
          title={`${s.numeral} — ${s.label}`}
          aria-current={active === s.id ? "true" : undefined}
        >
          {icons[s.icon]}
          <span className="left-rail-label">{s.numeral} — {s.label}</span>
        </a>
      ))}
    </nav>
  );
}
