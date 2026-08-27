"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useScoreModal } from "./score-modal";
import { ThemeToggle } from "./theme-toggle";
import { CatalogSearch } from "./catalog-search";
import type { Project } from "@/lib/data";

const sections = [
  { id: "watchlist", label: "WATCHLIST" },
  { id: "fresh-finds", label: "FRESH FINDS" },
  { id: "archive", label: "ARCHIVE" },
  { id: "methodology", label: "METHODOLOGY" },
];

export function NavBar({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { openScoreModal } = useScoreModal();

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        const el = document.activeElement as HTMLElement | null;
        if (el && el instanceof HTMLElement) el.blur();
        return;
      }
      if (e.key === "/" && window.matchMedia("(min-width: 640px)").matches) {
        const target = e.target as HTMLElement | null;
        const typing =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable);
        if (!typing) {
          e.preventDefault();
          const input = document.getElementById("desktop-catalog-search");
          if (input && input instanceof HTMLInputElement) input.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 border-b relative"
      style={{
        backgroundColor: "color-mix(in srgb, var(--color-bg) 82%, transparent)",
        backdropFilter: "blur(8px)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Data pulse riding the nav bottom hairline */}
      <div className="nav-pulse" aria-hidden="true" />
      <div className="px-4 flex items-center h-10">
        {/* Station identifier — Pulse wordmark */}
        <a href="#main-content" className="flex items-center gap-2 mr-3 no-underline">
          <svg
            aria-hidden="true"
            className="wordmark-wave"
            width="20"
            height="12"
            viewBox="0 0 24 12"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M0 6h4l2-4 3 8 3-12 3 10 2-4h7" />
          </svg>
          <span
            className="wordmark-text font-mono text-xs font-bold tracking-widest"
            style={{ color: "var(--color-text)" }}
          >
            PULSAROSS
          </span>
        </a>

        {/* System status — live indicator */}
        <div
          className="sys-active hidden md:flex items-center gap-1.5 mr-4"
          role="status"
        >
          <span className="sys-dot" aria-hidden="true" />
          <span
            className="font-mono text-[10px] tracking-[0.2em]"
            style={{ color: "var(--color-text-dim)" }}
          >
            SYSTEM ACTIVE
          </span>
        </div>

        {/* Separator */}
        <div
          className="w-px h-4 mr-4"
          style={{ backgroundColor: "var(--color-border)" }}
        />

        {/* Section links — desktop */}
        <div className="hidden sm:flex items-center gap-1">
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

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Global search — desktop */}
          <div className="hidden sm:block w-44 mr-1">
            <CatalogSearch projects={projects} inputId="desktop-catalog-search" />
          </div>

          <button
            onClick={openScoreModal}
            className="hidden sm:inline-flex font-mono text-[10px] tracking-widest px-2.5 py-1 border transition-colors hover:opacity-80"
            style={{
              color: "var(--color-accent)",
              borderColor: "var(--color-accent-border)",
              backgroundColor: "var(--color-accent-dim)",
            }}
          >
            How is a score made?
          </button>

          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="sm:hidden flex h-8 w-8 items-center justify-center border transition-colors"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden overflow-hidden border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              <div className="pb-2 mb-1 border-b" style={{ borderColor: "var(--color-border)" }}>
                <CatalogSearch projects={projects} onNavigate={() => setMenuOpen(false)} />
              </div>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="font-mono text-[11px] tracking-widest py-2 px-1 transition-colors"
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
              <button
                onClick={() => {
                  openScoreModal();
                  setMenuOpen(false);
                }}
                className="font-mono text-[11px] tracking-widest py-2 px-1 border-t mt-1 text-left"
                style={{
                  color: "var(--color-accent)",
                  borderColor: "var(--color-border)",
                }}
              >
                How is a score made?
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
