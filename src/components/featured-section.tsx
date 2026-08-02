"use client";

import { motion } from "framer-motion";
import type { Project, Genre } from "@/lib/data";

function SpecimenCard({
  project,
  rank,
  genreLabel,
  large,
}: {
  project: Project;
  rank: number;
  genreLabel: string;
  large?: boolean;
}) {
  const specimenId = `SP-${String(rank + 1).padStart(3, "0")}`;

  return (
    <a
      href={`/project/${encodeURIComponent(project.id)}`}
      className="group relative border p-6 flex flex-col justify-between overflow-hidden transition-all duration-300"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Labels row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] tracking-[0.15em] uppercase"
            style={{ color: "var(--color-text-dim)" }}
          >
            {specimenId}
          </span>
          <span
            className="font-mono text-[9px] tracking-widest uppercase px-1.5 py-0.5"
            style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}
          >
            {genreLabel}
          </span>
          {project.shizuku && (
            <span
              className="font-mono text-[9px] tracking-wider px-1.5 py-0.5"
              style={{ backgroundColor: "var(--color-signal-purple)", color: "var(--color-bg)" }}
            >
              SHIZUKU
            </span>
          )}
        </div>
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

      {/* Score bar */}
      <div
        className="w-full h-1 mb-5 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--color-ruled)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${project.score * 100}%`,
            backgroundColor: "var(--color-accent)",
          }}
        />
      </div>

      {/* Compact signal dots */}
      <div className="flex items-center gap-1.5 mb-5">
        {Object.entries(project.score_breakdown).map(([key, value]) => (
          <div key={key} className="flex items-center gap-1" title={`${key.replace("_", " ")}: ${(value as number).toFixed(2)}`}>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: `var(--color-signal-${key === "issue_health" ? "purple" : key === "contributors" ? "orange" : key === "license" ? "pink" : key === "momentum" ? "blue" : "green"})` }}
            />
          </div>
        ))}
        <span
          className="font-mono text-[9px] ml-1"
          style={{ color: "var(--color-text-dim)" }}
        >
          signals
        </span>
      </div>

      {/* Project name */}
      <h3
        className={`font-bold tracking-tight mb-1 group-hover:accent-text transition-colors ${large ? "text-2xl md:text-3xl" : "text-lg"}`}
        style={{ color: "var(--color-text)" }}
      >
        {project.name}
      </h3>

      {/* Owner */}
      <p
        className="font-mono text-[11px] mb-3"
        style={{ color: "var(--color-text-dim)" }}
      >
        {project.owner}
      </p>

      {/* Description */}
      <p
        className={`text-sm leading-relaxed mb-5 ${large ? "line-clamp-3" : "line-clamp-2"}`}
        style={{ color: "var(--color-text-muted)" }}
      >
        {project.description || "No description provided."}
      </p>

      {/* Footer — ruled line top */}
      <div
        className="pt-3 border-t flex items-center gap-4 text-xs"
        style={{ borderColor: "var(--color-ruled)" }}
      >
        {project.language && (
          <span
            className="flex items-center gap-1.5 font-medium"
            style={{ color: "var(--color-text)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--color-accent)" }}
            />
            {project.language}
          </span>
        )}
        <span
          className="flex items-center gap-1 font-mono"
          style={{ color: "var(--color-text-muted)" }}
        >
          ★ {project.stars.toLocaleString()}
        </span>
      </div>

      {/* Corner tick marks */}
      <div
        className="absolute top-0 left-0 w-3 h-3 border-t border-l"
        style={{ borderColor: "var(--color-accent)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 border-b border-r"
        style={{ borderColor: "var(--color-accent)" }}
      />
    </a>
  );
}

export function FeaturedSection({
  projects,
  genres,
}: {
  projects: Project[];
  genres: Genre[];
}) {
  const genreMap = new Map<string, string>(genres.map((g) => [g.id, g.label]));
  const featured = projects.slice(0, 5);

  return (
    <section id="specimens" className="relative py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="calibration-marks w-8" />
            <span
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "var(--color-text-dim)" }}
            >
              Section 03 / Specimen Gallery
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            style={{ color: "var(--color-text)" }}
          >
            Highest-scoring fresh finds
            <br />
            <span style={{ color: "var(--color-text-muted)" }}>right now</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base max-w-xl leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            Top specimens ranked by composite health score. Each card is a data point
            in our ongoing observation of the open-source ecosystem.
          </motion.p>
        </div>

        {/* Specimen grid — top 2 large, next 3 small */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {featured.slice(0, 2).map((p, i) => (
          <SpecimenCard
            key={p.id}
            project={p}
            rank={i}
            large
            genreLabel={genreMap.get(p.genre) ?? p.genre_label}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featured.slice(2, 5).map((p, i) => (
          <SpecimenCard
            key={p.id}
            project={p}
            rank={i + 2}
            genreLabel={genreMap.get(p.genre) ?? p.genre_label}
          />
        ))}
      </div>
      </div>
    </section>
  );
}
