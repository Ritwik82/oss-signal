"use client";

import { useState, useMemo, useEffect, useCallback, startTransition, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { WatchlistApp, GenreId, Genre, Project } from "@/lib/data";
import {
  useLocalWatchlist,
  toggleLocalWatchlist,
  toWatchlistAppFallback,
  importObtainiumExport,
} from "@/lib/local-watchlist";

// Hook to get current time that updates periodically without triggering lint errors
function useCurrentTime(intervalMs = 60_000): number {
  const [time, setTime] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setTime(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return time;
}

function stalenessColor(staleness?: string) {
  switch (staleness) {
    case "fresh": return "var(--color-signal-green)";
    case "warning": return "var(--color-signal-amber)";
    case "stale": return "var(--color-signal-orange)";
    case "abandoned": return "var(--color-signal-amber)";
    case "unknown": return "var(--color-signal-amber)";
    default: return "var(--color-text-dim)";
  }
}

function stalenessLabel(s?: string, notYetCatalogued?: boolean) {
  if (notYetCatalogued) return "NOT YET CATALOGUED";
  return s ? s.toUpperCase() : "UNKNOWN";
}

const STALENESS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fresh", label: "Fresh" },
  { value: "warning", label: "Warning" },
  { value: "stale", label: "Stale" },
  { value: "abandoned", label: "Abandoned" },
  { value: "not_yet_catalogued", label: "Not Catalogued" },
];

const chipStyle = (selected: boolean): React.CSSProperties => ({
  backgroundColor: selected ? "var(--color-accent-dim)" : "transparent",
  color: selected ? "var(--color-accent)" : "var(--color-text-dim)",
  borderColor: selected ? "var(--color-accent-border)" : "var(--color-border)",
});

const chipClass =
  "font-mono text-[10px] tracking-wider px-2 py-1 border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]";

function GenreChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={selected}
      onClick={onSelect}
      className={chipClass}
      style={chipStyle(selected)}
    >
      {label.toUpperCase()}
    </button>
  );
}

function StalenessChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={selected}
      onClick={onSelect}
      className={chipClass}
      style={chipStyle(selected)}
    >
      {label.toUpperCase()}
    </button>
  );
}

const PlainCard = motion.div;

function AppCard({
  app,
  genreLabel,
  onUntrack,
}: {
  app: WatchlistApp;
  genreLabel: string;
  onUntrack?: () => void;
}) {
  const color = stalenessColor(app.staleness);
  const badge = app.update_available;
  const linked = Boolean(app.repo);
  const isUnknown = app.staleness === "unknown";
  const notYetCatalogued = app.notYetCatalogued === true;
  const borderStyle = notYetCatalogued
    ? "1px dashed var(--color-signal-blue)"
    : isUnknown
    ? "1px dashed var(--color-signal-amber)"
    : undefined;
  return (
    <PlainCard
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass group relative p-4 flex flex-col justify-between transition-colors hover:border-[var(--color-accent-border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      style={{ boxShadow: "var(--card-shadow)", border: borderStyle }}
      whileHover={{ y: -1 }}
    >
      {/* Stretched link — whole card navigates when a repo exists;
          interactive controls sit above it with z-10 (no nested anchors). */}
      {linked && (
        <Link
          href={`/project/${app.repo}`}
          aria-label={`Open ${app.name} on OSS Signal`}
          className="absolute inset-0 z-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        />
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="font-mono text-[10px] tracking-widest uppercase px-1.5 py-0.5"
          style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}
        >
          {genreLabel}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] tracking-widest uppercase px-1.5 py-0.5"
            style={{
              color: app.installed ? "var(--color-text-muted)" : "var(--color-text-dim)",
            }}
          >
            {app.installed ? "INSTALLED" : "WATCHING"}
          </span>
          {badge && (
            <span
              className="badge-pulse font-mono text-[11px] px-1.5 py-0.5 whitespace-nowrap"
              style={{ backgroundColor: "var(--color-signal-green)", color: "var(--color-bg)" }}
            >
              UPDATE
            </span>
          )}
          {app.repo && (
            <a
              href={`https://github.com/${app.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${app.repo} on GitHub`}
              className="relative z-10 opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              style={{ color: "var(--color-accent)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.54 2.87 8.39 6.84 9.75.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05.8-.23 1.65-.34 2.5-.34s1.7.11 2.5.34c1.91-1.32 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.04 10.04 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <h4
        className="font-semibold text-sm tracking-tight line-clamp-1 mb-1"
        style={{ color: "var(--color-text)" }}
      >
        {app.name}
      </h4>
      <p className="font-mono text-[10px] mb-3" style={{ color: "var(--color-accent)" }}>
        {app.repo ?? app.source}
      </p>
      {notYetCatalogued && (
        <p className="font-mono text-[10px] mb-2" style={{ color: "var(--color-signal-blue)" }}>
          Not yet scanned — picked up in the next catalog refresh
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t"
        style={{ borderColor: "var(--color-ruled)" }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span
            className="font-mono text-[11px] tracking-wide"
            style={{ color: "var(--color-text-dim)" }}
          >
            {stalenessLabel(app.staleness, notYetCatalogued)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {app.latestVersion && (
            <span
              className="font-mono text-[11px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              v{app.latestVersion}
            </span>
          )}
          {onUntrack && (
            <button
              onClick={onUntrack}
              aria-label={`Stop tracking ${app.name}`}
              className="relative z-10 font-mono text-[10px] tracking-wider px-2 py-0.5 border transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              style={{
                color: "var(--color-text-dim)",
                borderColor: "var(--color-border)",
              }}
            >
              UNTRACK
            </button>
          )}
        </div>
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
    </PlainCard>
  );
}

export function WatchlistPanel({ apps, genres, projects }: { apps: WatchlistApp[]; genres: Genre[]; projects: Project[] }) {
  const genreMap = useMemo(() => new Map(genres.map((g) => [g.id as GenreId, g.label])), [genres]);
  const projectById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const now = useCurrentTime();
  const [collapsed, setCollapsed] = useState(false);
  const [genreFilter, setGenreFilter] = useState<GenreId | "all">("all");
  const [stalenessFilter, setStalenessFilter] = useState("all");
  const [importToast, setImportToast] = useState<string | null>(null);
  const [importToastError, setImportToastError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Derive staleness from a Project using the same thresholds as refresh-data.mjs
  // (14/30/90 days since last_release_at). Fall back to abandonment_risk heuristic
  // if last_release_at is unavailable.
  const deriveStalenessFromProject = useCallback(
    (p: Project, now: number): "fresh" | "warning" | "stale" | "abandoned" | "unknown" => {
      if (p.last_release_at) {
        const days = (now - new Date(p.last_release_at).getTime()) / 86_400_000;
        if (days < 14) return "fresh";
        if (days < 30) return "warning";
        if (days < 90) return "stale";
        return "abandoned";
      }
      // Fallback: approximate from abandonment_risk (0-1, computed from pushed_at at build time)
      const risk = p.abandonment_risk;
      if (risk === 0) return "fresh";
      if (risk === 1) return "abandoned";
      // risk in (0,1) spans warning (14-30d) and stale (30-90d) — treat conservatively as warning
      return "warning";
    },
    []
  );

  // Build a WatchlistApp from a Project for locally tracked apps that exist in the catalog.
  const watchlistAppFromProject = useCallback(
    (p: Project, now: number): WatchlistApp => {
      const staleness = deriveStalenessFromProject(p, now);
      return {
        id: p.id,
        name: p.name,
        genre: p.genre,
        source: "local",
        repo: p.id,
        installedVersion: null,
        latestVersion: null,
        installed: false,
        trackOnly: true,
        fdroid: false,
        last_release_at: p.last_release_at,
        staleness,
        update_available: false,
        notYetCatalogued: false,
      };
    },
    [deriveStalenessFromProject]
  );

  useEffect(() => {
    if (!importToast) return;
    const t = setTimeout(() => {
      setImportToast(null);
      setImportToastError(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [importToast]);

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importObtainiumExport(file);
      setImportToast(count > 0 ? `Imported ${count} app${count !== 1 ? "s" : ""}.` : "No new apps in that file.");
      setImportToastError(false);
    } catch (err) {
      setImportToast(err instanceof Error ? err.message : "Couldn't import that file.");
      setImportToastError(true);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Server watchlist (empty at launch) merged with each visitor's local tracking.
  const local = useLocalWatchlist();
  const allApps = useMemo(() => {
    const byKey = new Map<string, WatchlistApp>();
    for (const a of apps) byKey.set(a.repo ?? a.id, a);
    for (const l of local) {
      const key = l.repo ?? l.id;
      if (byKey.has(key)) continue;
      const project = projectById.get(key);
      if (project) {
        byKey.set(key, watchlistAppFromProject(project, now));
      } else {
        byKey.set(key, toWatchlistAppFallback(l));
      }
    }
    return [...byKey.values()];
  }, [apps, local, projectById, now, watchlistAppFromProject]);

  const filtered = useMemo(() => {
    let list = allApps;
    if (genreFilter !== "all") list = list.filter((a) => a.genre === genreFilter);
    if (stalenessFilter !== "all") list = list.filter((a) => a.staleness === stalenessFilter);
    return list;
  }, [allApps, genreFilter, stalenessFilter]);

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

  const localKeys = useMemo(() => new Set(local.map((l) => l.repo ?? l.id)), [local]);
  const renderCard = (app: WatchlistApp) => (
    <AppCard
      key={app.id}
      app={app}
      genreLabel={genreMap.get(app.genre) ?? app.genre}
      onUntrack={
        localKeys.has(app.repo ?? app.id)
          ? () =>
              toggleLocalWatchlist({
                id: app.repo ?? app.id,
                name: app.name,
                repo: app.repo,
                genre: app.genre,
                source: "local",
              })
          : undefined
      }
    />
  );

  return (
    <section id="watchlist" className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
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
              {allApps.length === 0
                ? "Nothing tracked yet — track apps from Fresh Finds or any project page."
                : attention.length > 0
                  ? `${attention.length} need attention, ${updateCount} update${updateCount !== 1 ? "s" : ""} ready.`
                  : `${allApps.length} tracked apps. All clear.`}
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
        {!collapsed && allApps.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span
              className="font-mono text-[10px] tracking-widest uppercase mr-1"
              style={{ color: "var(--color-text-dim)" }}
            >
              genre
            </span>
            <GenreChip
              label="All"
              selected={genreFilter === "all"}
              onSelect={() => startTransition(() => setGenreFilter("all"))}
            />
            {(["customization", "shizuku", "media", "utility", "productivity", "security", "store", "education", "dev-tools", "other"] as GenreId[]).map((g) => (
              <GenreChip
                key={g}
                label={genreMap.get(g) ?? g}
                selected={genreFilter === g}
                onSelect={() => startTransition(() => setGenreFilter(g))}
              />
            ))}
          </div>
        )}
        {!collapsed && allApps.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span
              className="font-mono text-[10px] tracking-widest uppercase mr-1"
              style={{ color: "var(--color-text-dim)" }}
            >
              staleness
            </span>
            {STALENESS_OPTIONS.map((o) => (
              <StalenessChip
                key={o.value}
                label={o.label}
                selected={stalenessFilter === o.value}
                onSelect={() => startTransition(() => setStalenessFilter(o.value))}
              />
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
              {allApps.length === 0 && (
                <div
                  className="glass p-8 text-center"
                  style={{
                    boxShadow: "var(--card-shadow)",
                    border: "1px dashed var(--color-signal-amber)",
                  }}
                >
                  <p
                    className="font-mono text-[10px] tracking-widest uppercase mb-2"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    Empty watchlist
                  </p>
                  <p
                    className="text-sm max-w-md mx-auto leading-relaxed"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Track apps with the TRACK button on any Fresh Finds card or project
                    page, or import your own app list from an Obtainium export — they
                    appear here, stored in your browser. Only you see this list.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={onImportFile}
                      aria-label="Import Obtainium export"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="font-mono text-[10px] tracking-wider px-3 py-1.5 border transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                      style={{
                        color: "var(--color-accent)",
                        borderColor: "var(--color-accent-border)",
                        backgroundColor: "var(--color-accent-dim)",
                      }}
                    >
                      Import Obtainium export
                    </button>
                    <a
                      href="#fresh-finds"
                      className="font-mono text-[10px] tracking-wider px-3 py-1.5 border transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                      style={{
                        color: "var(--color-text-dim)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      Browse Fresh Finds ↓
                    </a>
                  </div>
                </div>
              )}
              {attention.length > 0 && (
                <>
                  <p
                    className="font-mono text-[10px] tracking-widest uppercase mb-3"
                    style={{ color: "var(--terracotta)" }}
                  >
                    Needs attention ({attention.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {attention.map(renderCard)}
                  </div>
                </>
              )}
              {current.length > 0 && (
                <>
                  <p
                    className="font-mono text-[10px] tracking-widest uppercase mb-3"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    Current ({current.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {current.map(renderCard)}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Import toast */}
      {importToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] glass px-4 py-2 font-mono text-[11px] tracking-wider"
          style={{
            color: importToastError ? "var(--color-signal-red)" : "var(--color-text)",
            borderColor: importToastError ? "var(--color-signal-red)" : "var(--color-accent-border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {importToast}
        </div>
      )}
    </section>
  );
}
