"use client";

import { useEffect, useState, useCallback, useMemo, startTransition } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Project, Genre, GenreId } from "@/lib/data";
import { useLocalWatchlist, toggleLocalWatchlist } from "@/lib/local-watchlist";
import { FilterChipGroup } from "./filter-chip";

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

function scoreColor(score: number): string {
  const s = score * 10;
  if (s >= 7) return "var(--color-signal-green)";
  if (s >= 4) return "var(--color-signal-amber)";
  return "var(--color-signal-red)";
}

export function FreshFinds({ projects, genres }: { projects: Project[]; genres: Genre[] }) {
  const genreMap = new Map<GenreId, string>(genres.map((g) => [g.id as GenreId, g.label]));
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [sort, setSort] = useState<"score" | "newest" | "stars">("score");
  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages - 1);

  const sorted = useMemo(() => {
    const list = [...projects];
    if (sort === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.added_at ?? b.created_at).getTime() -
          new Date(a.added_at ?? a.created_at).getTime()
      );
    } else if (sort === "stars") {
      list.sort((a, b) => b.stars - a.stars);
    } else {
      list.sort((a, b) => b.score - a.score);
    }
    return list;
  }, [projects, sort]);

  const visible = sorted.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const copyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setToast("GitHub link copied.");
    } catch {
      setToast("Copy failed — grab the URL from the card.");
    }
  }, []);

  const local = useLocalWatchlist();
  const trackedIds = useMemo(() => new Set(local.map((l) => l.id)), [local]);
  const toggleTrack = useCallback((p: Project) => {
    const added = toggleLocalWatchlist({
      id: p.id,
      name: p.name,
      repo: p.id,
      genre: p.genre,
      source: "local",
    });
    setToast(added ? `Added ${p.name} to your watchlist.` : `Removed ${p.name} from your watchlist.`);
  }, []);

  return (
    <section id="fresh-finds" className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            New &amp; actively maintained
          </h2>
          <p
            className="text-sm max-w-lg mt-2 leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            Open-source apps launched in the last 9 months, scored on activity,
            contributors, and freshness. No abandoned projects.
          </p>
          <div className="mt-3">
            <FilterChipGroup
              label="sort"
              options={[
                { value: "score", label: "SCORE" },
                { value: "newest", label: "NEWEST" },
                { value: "stars", label: "STARS" },
              ]}
              value={sort}
              onChange={(v) => startTransition(() => setSort(v as "score" | "newest" | "stars"))}
              useStartTransition
            />
          </div>
        </div>

        {/* Grid */}
        {projects.length === 0 ? (
          <div className="glass p-12 text-center">
            <p className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--color-text-dim)" }}>
              No fresh finds yet
            </p>
            <p className="text-sm max-w-md mx-auto leading-relaxed mb-4" style={{ color: "var(--color-text-muted)" }}>
              Fresh Finds shows open-source apps launched in the last 9 months that
              score well on activity and freshness. The catalog is updated periodically.
            </p>
            <p className="text-sm max-w-md mx-auto leading-relaxed mb-4" style={{ color: "var(--color-text-muted)" }}>
              If you&apos;re seeing this, the data may need refreshing. Run the update script
              to pull the latest from F-Droid and GitHub.
            </p>
            <code className="font-mono text-xs px-2 py-1 rounded" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-accent)", border: "1px solid var(--color-border)" }}>
              node scripts/refresh-data.mjs
            </code>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map((p, idx) => (
                <FreshCard
                  key={p.id}
                  project={p}
                  genreLabel={genreMap.get(p.genre) ?? p.genre_label}
                  onCopy={copyLink}
                  tracked={trackedIds.has(p.id)}
                  onToggleTrack={() => toggleTrack(p)}
                  featured={idx === 0 && clampedPage === 0}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div
                className="glass flex items-center justify-between mt-8 p-4"
              >
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={clampedPage === 0}
                  aria-disabled={clampedPage === 0}
                  className="font-mono text-[10px] tracking-wider px-3 py-1.5 border disabled:opacity-40 transition-colors"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  ← Prev
                </button>
                <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--color-text-dim)" }}>
                  {clampedPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={clampedPage >= totalPages - 1}
                  aria-disabled={clampedPage >= totalPages - 1}
                  className="font-mono text-[10px] tracking-wider px-3 py-1.5 border disabled:opacity-40 transition-colors"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] glass px-4 py-2 font-mono text-[11px] tracking-wider"
          style={{
            color: "var(--color-text)",
            borderColor: "var(--color-accent-border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {toast}
        </div>
      )}
    </section>
  );
}

function FreshCard({
  project,
  genreLabel,
  onCopy,
  tracked,
  onToggleTrack,
  featured = false,
}: {
  project: Project;
  genreLabel: string;
  onCopy: (url: string) => void;
  tracked: boolean;
  onToggleTrack: () => void;
  featured?: boolean;
}) {
  const days = daysSince(project.last_release_at);
  const isFresh = days !== null && days < 14;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      className={`glass group relative p-5 flex flex-col justify-between transition-all hover:border-[var(--color-accent-border)] ${featured ? "lg:col-span-2 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-hover)]" : ""}`}
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      {featured && (
        <div className="mb-3 inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded border border-[var(--color-signal-green)]/30 bg-[var(--color-signal-green)]/10 text-[var(--color-signal-green)] font-mono text-[10px] font-medium tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-signal-green)] animate-pulse" />
          Spotlight Fresh App
        </div>
      )}

      {/* Top row: genre + score */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className="font-mono text-[10px] tracking-widest uppercase px-1.5 py-0.5"
          style={{
            backgroundColor: "var(--color-accent-dim)",
            color: "var(--color-accent)",
          }}
        >
          {genreLabel}
        </span>
        <div className="flex items-center gap-2">
          {project.shizuku && (
            <span
              className="font-mono text-[10px] tracking-wider px-1.5 py-0.5"
              style={{
                backgroundColor: "var(--color-signal-purple)",
                color: "var(--color-bg)",
              }}
            >
              SHIZUKU
            </span>
          )}
          <span
            className="font-mono text-xs font-bold px-2 py-0.5 border"
            style={{
              color: "var(--color-accent)",
              borderColor: "var(--color-accent-border)",
              backgroundColor: "var(--color-accent-dim)",
            }}
          >
            {(project.score * 10).toFixed(1)}
          </span>
        </div>
      </div>

      {/* Score bar (10px track, decision #40) + number beside */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="h-[10px] flex-1 overflow-hidden rounded-sm"
          style={{ backgroundColor: "var(--color-ruled)" }}
        >
          <div
            className="h-full transition-[width] duration-500"
            style={{
              width: `${project.score * 100}%`,
              backgroundColor: scoreColor(project.score),
            }}
          />
        </div>
        <span className="font-mono text-[10px] font-bold" style={{ color: "var(--color-accent)" }}>
          {(project.score * 10).toFixed(1)}/10
        </span>
      </div>

      {/* Name + owner link */}
      <Link
        href={`/project/${project.id}`}
        className="block mb-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        aria-label={`Open ${project.name} on PulsarOss`}
      >
        <h4
          className="font-semibold text-sm tracking-tight line-clamp-1 mb-0.5 transition-colors group-hover:text-[var(--color-accent)]"
          style={{ color: "var(--color-text)" }}
        >
          {project.name}
        </h4>
        <p className="font-mono text-[10px]" style={{ color: "var(--color-text-dim)" }}>
          {project.owner}
        </p>
      </Link>

      {/* Description */}
      <p
        className="text-sm leading-relaxed line-clamp-2 mb-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        {project.description || "No description provided."}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between gap-2 pt-3 border-t flex-wrap"
        style={{ borderColor: "var(--color-ruled)" }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          <span
            className="font-medium text-xs truncate"
            style={{ color: "var(--color-text)" }}
          >
            {project.language || "—"}
          </span>
          <span
            className="font-mono text-xs whitespace-nowrap"
            style={{ color: "var(--color-text-muted)" }}
          >
            ★ {project.stars.toLocaleString()}
          </span>
          {days != null && (
            <span
              className="font-mono text-[11px] whitespace-nowrap"
              style={{ color: "var(--color-text-dim)" }}
              title="Updated Xd ago"
            >
              {days}d ago
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {isFresh && (
            <span
              className="badge-pulse font-mono text-[11px] px-1.5 py-0.5"
              style={{ backgroundColor: "var(--color-signal-green)", color: "var(--color-bg)" }}
            >
              NEW
            </span>
          )}
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${project.name} on GitHub`}
            className="relative z-10 flex items-center border px-2 py-1 transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            style={{
              color: "var(--color-accent)",
              borderColor: "var(--color-accent-border)",
              backgroundColor: "var(--color-accent-dim)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.54 2.87 8.39 6.84 9.75.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.05.8-.23 1.65-.34 2.5-.34s1.7.11 2.5.34c1.91-1.32 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.04 10.04 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
            </svg>
          </a>
          <button
            onClick={onToggleTrack}
            aria-pressed={tracked}
            aria-label={tracked ? `Stop tracking ${project.name}` : `Track ${project.name}`}
            className="relative z-10 font-mono text-[10px] tracking-wider px-2 py-1 border transition-all hover:opacity-80 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            style={{
              color: tracked ? "var(--color-signal-green)" : "var(--color-accent)",
              borderColor: tracked ? "var(--color-signal-green)" : "var(--color-accent-border)",
              backgroundColor: tracked ? "transparent" : "var(--color-accent-dim)",
            }}
          >
            {tracked ? "TRACKED" : "TRACK"}
          </button>
          <button
            onClick={() => onCopy(project.url)}
            aria-label={`Copy GitHub link for ${project.name}`}
            className="relative z-10 font-mono text-[10px] tracking-wider px-2 py-1 border transition-all hover:opacity-80 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            style={{
              color: "var(--color-accent)",
              borderColor: "var(--color-accent-border)",
              backgroundColor: "var(--color-accent-dim)",
            }}
          >
            Copy GitHub link
          </button>
        </div>
      </div>

      {/* Corner ticks */}
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
