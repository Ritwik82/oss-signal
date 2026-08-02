"use client";

import { useState, useEffect } from "react";

const sections = [
  { id: "station", label: "STATION" },
  { id: "notebook", label: "NOTEBOOK" },
  { id: "specimens", label: "SPECIMENS" },
  { id: "archive", label: "ARCHIVE" },
];

export function NavBar() {
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
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center h-10">
        {/* Station identifier */}
        <div className="flex items-center gap-2 mr-6">
          <span className="status-dot" />
          <span
            className="font-mono text-xs font-bold tracking-widest"
            style={{ color: "var(--color-accent)" }}
          >
            OSS SIGNAL
          </span>
        </div>

        {/* Separator */}
        <div
          className="w-px h-4 mr-4"
          style={{ backgroundColor: "var(--color-border)" }}
        />

        {/* Section links */}
        <div className="flex items-center gap-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="font-mono text-[10px] tracking-widest px-2.5 py-1 transition-colors"
              style={{
                color:
                  active === s.id
                    ? "var(--color-accent)"
                    : "var(--color-text-dim)",
              }}
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* Right side — timestamp */}
        <div className="ml-auto flex items-center gap-2">
          <span
            className="font-mono text-[10px] tracking-wider"
            style={{ color: "var(--color-text-dim)" }}
          >
            SYS/{new Date().getFullYear()}
          </span>
        </div>
      </div>
    </nav>
  );
}
