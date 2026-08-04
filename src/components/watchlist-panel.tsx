"use client";

import { useState, useMemo, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WatchlistApp, GenreId, Genre } from "@/lib/data";

function stalenessColor(staleness?: string) {
  switch (staleness) {
    case "fresh": return "var(--color-signal-green)";
    case "warning": return "var(--color-accent)";
    case "stale": return "var(--color-signal-orange)";
    case "abandoned": return "var(--color-signal-pink)";
    default: return "var(--color-text-dim)";
  }
}

function stalenessLabel(s?: string) {
  return s ? s.toUpperCase() : "UNKNOWN";
}

export function WatchlistPanel({ apps, genres }: { apps: WatchlistApp[]; genres: Genre[] }) {
  const genreMap = useMemo(() => new Map(genres.map((g) => [g.id as GenreId, g.label])), [genres]);
  const [collapsed, setCollapsed] = useState(false);
  const [genreFilter, setGenreFilter] = useState<GenreId | "all">("all");
  const [stalenessFilter, setStalenessFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = apps;
    if (genreFilter !== "all") list = list.filter((a) => a.genre === genreFilter);
    if (stalenessFilter !== "all") list = list.filter((a) => a.staleness === stalenessFilter);
    return list;
  }, [apps, genreFilter, stalenessFilter]);

  // Needs-attention group first (mockup-v2 rule 3: abandonment is the #1 surface)
  const attention = useMemo(
    () =>
      filtered.filter(
        (a) => a.staleness === "stale" || a.staleness === "abandoned" || a.staleness === "warning"
      ),
    [filtered]
  );
  const current = useMemo(
    () => filtered.filter((a) => !attention.includes(a)),
    [filtered, attention]
  );

  const updateCount = filtered.filter((a) => a.update_available).length;

  function GenreChip({ id, label }: { id: GenreId | "all"; label: string }) {
    const selected = genreFilter === id;
    return (
      <button
        role="checkbox"
        aria-checked={selected}
        onClick={() => startTransition(() => setGenreFilter(id as GenreId | "all"))}
        className="font-mono text-[9px] tracking-wider px-2 py-1 border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        style={{
          backgroundColor: selected ? "var(--color-accent-dim)" : "transparent",
          color: selected ? "var(--color-accent)" : "var(--color-text-dim)",
          borderColor: selected ? "var(--color-accent-border)" : "var(--color-border)",
        }}
      >
        {label.toUpperCase()}
      </button>
    );
  }

  function AppCard({ app }: { app: WatchlistApp }) {
    const color = stalenessColor(app.staleness);
    const badge = app.update_available;
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass group relative p-4 flex flex-col justify-between transition-colors hover:border-[var(--color-accent-border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        style={{ boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)" }}
        whileHover={{ y: -1 }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="font-mono text-[9px] tracking-widest uppercase px-1.5 py-0.5"
            style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}
          >
            {genreMap.get(app.genre) ?? app.genre}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5"
              style={{
                color: app.installed ? "var(--color-text-muted)" : "var(--color-text-dim)",
              }}
            >
              {app.installed ? "INSTALLED" : "WATCHING"}
            </span>
            {badge && (
              <span
                className="badge-pulse font-mono text-[9px] px-1.5 py-0.5 whitespace-nowrap"
                style={{ backgroundColor: "var(--color-signal-green)", color: "var(--color-bg)" }}
              >
                UPDATE
              </span>
            )}
          </div>
        </div>

        <h4
          className="font-semibold text-sm tracking-tight line-clamp-1 mb-1"
          style={{ color: "var(--color-text)" }}
        >
          {app.name}
        </h4>
        <p className="font-mono text-[10px] mb-3" style={{ color: "var(--color-text-dim)" }}>
          {app.repo ?? app.source}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t"
          style={{ borderColor: "var(--color-ruled)" }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span
              className="font-mono text-[9px] tracking-wide"
              style={{ color: "var(--color-text-dim)" }}
            >
              {stalenessLabel(app.staleness)}
            </span>
          </div>
          {app.latestVersion && (
            <span
              className="font-mono text-[9px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              v{app.latestVersion}
            </span>
          )}
        </div>

        {/* Corner marks */}
        <div
          className="absolute top-0 left-0 w-2 h-2 border-t border-l"
          style={{ borderColor: "var(--color-accent)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-2 h-2 border-b border-r"
          style={{ borderColor: "var(--color-accent)" }}
        />
      </motion.div>
    );
  }

  return (
    <section id="watchlist" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="calibration-marks w-8" />
              <span
                className="font-mono text-[10px] tracking-[0.2em] uppercase"
                style={{ color: "var(--color-text-dim)" }}
              >
                Section 01 / Your Watchlist
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight serif-display"
              style={{ color: "var(--color-text)" }}
            >
              Apps you rely on
            </h2>
            <p
              className="text-sm max-w-lg mt-2 leading-relaxed"
              style={{ color: "var(--color-text-muted)" }}
            >
              {attention.length > 0
                ? `${attention.length} need attention, ${updateCount} update${updateCount !== 1 ? "s" : ""} ready.`
                : `${apps.length} tracked apps. All clear.`}
            </p>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand watchlist" : "Collapse watchlist"}
            className="font-mono text-[10px] tracking-widest px-3 py-1.5 border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-dim)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            {collapsed ? "EXPAND ↓" : "COLLAPSE ↑"}
          </button>
        </div>

        {/* Filters */}
        {!collapsed && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span
              className="font-mono text-[9px] tracking-widest uppercase mr-1"
              style={{ color: "var(--color-text-dim)" }}
            >
              genre
            </span>
            <GenreChip id="all" label="All" />
            {(["customization", "shizuku", "media", "utility", "productivity", "security", "store", "education", "dev-tools", "other"] as GenreId[]).map((g) => (
              <GenreChip key={g} id={g} label={genreMap.get(g) ?? g} />
            ))}
          </div>
        )}

        {/* Grid */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              {attention.length > 0 && (
                <>
                  <p
                    className="font-mono text-[9px] tracking-widest uppercase mb-3"
                    style={{ color: "var(--terracotta)" }}
                  >
                    Needs attention ({attention.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {attention.map((app) => (
                      <AppCard key={app.id} app={app} />
                    ))}
                  </div>
                </>
              )}
              {current.length > 0 && (
                <>
                  <p
                    className="font-mono text-[9px] tracking-widest uppercase mb-3"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    Current ({current.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {current.map((app) => (
                      <AppCard key={app.id} app={app} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
