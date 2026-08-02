"use client";

import { useEffect, useState } from "react";
import type { Project, Genre, GenreId } from "@/lib/data";
import { RelativeTime } from "./relative-time";

function abandonColor(risk: number) {
  if (risk < 0.2) return "var(--color-signal-green)";
  if (risk < 0.5) return "var(--color-accent)";
  return "var(--color-signal-pink)";
}

function abandonLabel(risk: number) {
  if (risk < 0.2) return "Fresh";
  if (risk < 0.5) return "Stale risk";
  return "Abandoned risk";
}

export function FreshFinds({ projects, genres }: { projects: Project[]; genres: Genre[] }) {
  const genreMap = new Map<GenreId, string>(genres.map((g) => [g.id as GenreId, g.label]));
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages - 1);
  const visible = projects.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

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
        </div>

        {/* Grid */}
        {projects.length === 0 ? (
          <div
            className="border p-12 text-center"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
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
                <FreshCard key={p.id} project={p} genreLabel={genreMap.get(p.genre) ?? p.genre_label} />
              ))}
            </div>
            {totalPages > 1 && (
              <div
                className="flex items-center justify-between border mt-8 p-4"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
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
    </section>
  );
}

function FreshCard({ project, genreLabel }: { project: Project; genreLabel: string }) {
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (project.last_release_at) {
      setIsNew((Date.now() - new Date(project.last_release_at).getTime()) / 1000 / 86400 < 14);
    }
  }, [project.last_release_at]);

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative border p-5 flex flex-col justify-between transition-colors hover:bg-[var(--color-surface-hover)]"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Top row: genre + score */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className="font-mono text-[9px] tracking-widest uppercase px-1.5 py-0.5"
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
              className="font-mono text-[9px] tracking-wider px-1.5 py-0.5"
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

      {/* Score bar */}
      <div
        className="w-full h-0.5 mb-4 overflow-hidden"
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

      {/* Name + owner */}
      <h4
        className="font-semibold text-sm tracking-tight line-clamp-1 mb-0.5"
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

      {/* Description */}
      <p
        className="text-sm leading-relaxed line-clamp-2 mb-4"
        style={{ color: "var(--color-text-muted)" }}
      >
        {project.description || "No description provided."}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between text-xs pt-3 border-t"
        style={{ borderColor: "var(--color-ruled)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="font-medium"
            style={{ color: "var(--color-text)" }}
          >
            {project.language || "—"}
          </span>
          <span
            className="font-mono"
            style={{ color: "var(--color-text-muted)" }}
          >
            ★ {project.stars.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isNew && (
            <span
              className="font-mono text-[9px] px-1.5 py-0.5"
              style={{ backgroundColor: "var(--color-signal-green)", color: "var(--color-bg)" }}
            >
              NEW RELEASE
            </span>
          )}
          <span
            className="font-mono text-[9px]"
            style={{ color: abandonColor(project.abandonment_risk) }}
            title={`Abandonment risk: ${abandonLabel(project.abandonment_risk)}`}
          >
            {abandonLabel(project.abandonment_risk)}
          </span>
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
    </a>
  );
}
