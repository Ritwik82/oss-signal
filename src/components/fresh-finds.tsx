"use client";

import { useEffect, useState, useCallback } from "react";
import type { Project, Genre, GenreId } from "@/lib/data";

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

export function FreshFinds({ projects, genres }: { projects: Project[]; genres: Genre[] }) {
  const genreMap = new Map<GenreId, string>(genres.map((g) => [g.id as GenreId, g.label]));
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages - 1);
  const visible = projects.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const copyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setToast("Obtainium link copied.");
    } catch {
      setToast("Copy failed — grab the URL from the card.");
    }
  }, []);

  return (
    <section id="fresh-finds" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="calibration-marks w-8" />
            <span
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "var(--color-text-dim)" }}
            >
              Section 02 / Fresh Finds
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold tracking-tight serif-display"
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
        </div>

        {/* Grid */}
        {projects.length === 0 ? (
          <div
            className="glass p-12 text-center"
          >
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No fresh finds today. Run{" "}
              <code
                className="font-mono text-xs px-1 py-0.5"
                style={{ backgroundColor: "var(--color-bg)", color: "var(--color-accent)" }}
              >
                node scripts/refresh-data.mjs
              </code>{" "}
              to update.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map((p) => (
                <FreshCard
                  key={p.id}
                  project={p}
                  genreLabel={genreMap.get(p.genre) ?? p.genre_label}
                  onCopy={copyLink}
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
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
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
}: {
  project: Project;
  genreLabel: string;
  onCopy: (url: string) => void;
}) {
  const days = daysSince(project.last_release_at);
  const isFresh = days !== null && days < 14;

  return (
    <div
      className="glass group relative p-5 flex flex-col justify-between transition-colors hover:border-[var(--color-accent-border)]"
      style={{ boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)" }}
    >
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
              backgroundColor: "var(--color-accent)",
            }}
          />
        </div>
        <span className="font-mono text-[10px] font-bold" style={{ color: "var(--color-accent)" }}>
          {(project.score * 10).toFixed(1)}/10
        </span>
      </div>

      {/* Name + owner — internal link */}
      <a
        href={`/project/${encodeURIComponent(project.id)}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      >
        <h4
          className="font-semibold text-sm tracking-tight line-clamp-1 mb-0.5 transition-colors group-hover:text-[var(--color-accent)]"
          style={{ color: "var(--color-text)" }}
        >
          {project.name}
        </h4>
        <p
          className="font-mono text-[10px] mb-3"
          style={{ color: "var(--color-text-dim)" }}
        >
          {project.owner}/{project.name}
        </p>
      </a>

      {/* Description */}
      <p
        className="text-sm leading-relaxed line-clamp-2 mb-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        {project.description || "No description provided."}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between gap-2 pt-3 border-t"
        style={{ borderColor: "var(--color-ruled)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
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
        <div className="flex items-center gap-2 shrink-0">
          {isFresh && (
            <span
              className="badge-pulse font-mono text-[11px] px-1.5 py-0.5"
              style={{ backgroundColor: "var(--color-signal-green)", color: "var(--color-bg)" }}
            >
              NEW
            </span>
          )}
          <button
            onClick={() => onCopy(project.url)}
            aria-label={`Copy Obtainium link for ${project.name}`}
            className="font-mono text-[10px] tracking-wider px-2 py-1 border transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            style={{
              color: "var(--color-accent)",
              borderColor: "var(--color-accent-border)",
              backgroundColor: "var(--color-accent-dim)",
            }}
          >
            Copy Obtainium link
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
    </div>
  );
}
