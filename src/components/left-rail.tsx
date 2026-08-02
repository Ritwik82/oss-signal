"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "station", numeral: "I", label: "Station" },
  { id: "notebook", numeral: "II", label: "Notebook" },
  { id: "specimens", numeral: "III", label: "Specimens" },
  { id: "archive", numeral: "IV", label: "Archive" },
];

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
              active === s.id
                ? "var(--color-accent)"
                : "var(--color-text-dim)",
          }}
          aria-label={`${s.numeral} — ${s.label}`}
        >
          <span className="left-rail-numeral">{s.numeral}</span>
          <span className="left-rail-label">{s.label}</span>
        </a>
      ))}
    </nav>
  );
}
