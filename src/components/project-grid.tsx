"use client";

import { useState, useMemo, useEffect, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project, Genre, GenreId } from "@/lib/data";

function FilterChip({
  label,
  selected,
  onClick,
  ariaLabel,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      className="font-mono text-[10px] tracking-wider px-2.5 py-1 border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      style={{
        backgroundColor: selected ? "var(--color-accent-dim)" : "transparent",
        color: selected ? "var(--color-accent)" : "var(--color-text-dim)",
        borderColor: selected ? "var(--color-accent-border)" : "var(--color-border)",
      }}
    >
      {label}
    </button>
  );
}

function OptionChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className="font-mono text-[10px] tracking-widest uppercase shrink-0"
        style={{ color: "var(--color-text-dim)" }}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {options.map((o) => (
          <FilterChip
            key={o.value}
            label={o.label}
            selected={value === o.value}
            onClick={() => onChange(o.value)}
            ariaLabel={`${label}: ${o.label}`}
          />
        ))}
      </div>
    </div>
  );
}

type SortField = "score" | "stars" | "newest" | "recency" | "abandonment";

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

function ArchiveRow({
  project,
  index,
  genreMap,
}: {
  project: Project;
  index: number;
  genreMap: Map<string, string>;
}) {
  const specimenId = `SP-${String(index + 1).padStart(3, "0")}`;
  const days = daysSince(project.last_release_at);

  return (
    <motion.a
      href={`/project/${encodeURIComponent(project.id)}`}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.35 }}
      className="glass group relative flex items-center gap-3 px-4 min-h-[44px] transition-colors hover:border-[var(--color-accent-border)] focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-[var(--color-accent)]"
    >
      {/* Corner tick */}
      <span
        className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-0.5"
        style={{ backgroundColor: "var(--color-accent)" }}
      />

      {/* Specimen code */}
      <span
        className="hidden sm:block font-mono text-[10px] tracking-[0.15em] uppercase w-14 shrink-0"
        style={{ color: "var(--color-text-dim)" }}
      >
        {specimenId}
      </span>

      {/* Name + owner */}
      <span className="min-w-0 flex-1 flex items-baseline gap-2">
        <span
          className="text-sm font-semibold tracking-tight truncate transition-colors group-hover:text-[var(--color-accent)]"
          style={{ color: "var(--color-text)" }}
        >
          {project.name}
        </span>
        <span
          className="hidden md:inline font-mono text-[10px] truncate"
          style={{ color: "var(--color-text-dim)" }}
        >
          {project.owner}
        </span>
      </span>

      {/* Genre chip */}
      <span
        className="hidden lg:inline font-mono text-[9px] tracking-widest uppercase px-1.5 py-0.5 shrink-0"
        style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}
      >
        {genreMap.get(project.genre) ?? project.genre}
      </span>

      {/* Score bar + number */}
      <span className="flex items-center gap-2 shrink-0">
        <span
          className="hidden md:block w-20 h-[10px] overflow-hidden rounded-sm"
          style={{ backgroundColor: "var(--color-ruled)" }}
        >
          <span
            className="block h-full transition-[width] duration-500"
            style={{ width: `${project.score * 100}%`, backgroundColor: "var(--color-accent)" }}
          />
        </span>
        <span
          className="font-mono text-xs font-bold w-9 text-right"
          style={{ color: "var(--color-accent)" }}
        >
          {(project.score * 10).toFixed(1)}
        </span>
      </span>

      {/* Last release */}
      <span
        className="hidden lg:inline font-mono text-[10px] w-16 text-right shrink-0"
        style={{ color: "var(--color-text-dim)" }}
      >
        {days != null ? `${days}d ago` : "—"}
      </span>

      {/* Stars */}
      <span
        className="hidden sm:inline font-mono text-[10px] w-12 text-right shrink-0"
        style={{ color: "var(--color-text-muted)" }}
      >
        ★{project.stars >= 1000 ? `${(project.stars / 1000).toFixed(1)}k` : project.stars}
      </span>
    </motion.a>
  );
}

export function ProjectGrid({
  projects,
  genres,
}: {
  projects: Project[];
  genres: Genre[];
}) {
  const genreMap = useMemo(
    () => new Map<GenreId, string>(genres.map((g) => [g.id as GenreId, g.label])),
    [genres]
  );
  const genreOptions = useMemo(
    () => [
      { value: "all", label: "ALL" },
      ...genres.map((g) => ({ value: g.id as string, label: g.label.toUpperCase() })),
    ],
    [genres]
  );

  const [collapsed, setCollapsed] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 24;
  const [lang, setLang] = useState("all");
  const [minScore, setMinScore] = useState("all");
  const [minStars, setMinStars] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [shizukuFilter, setShizukuFilter] = useState("all");
  const [activeDays, setActiveDays] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [showGeneric, setShowGeneric] = useState(true);

  const languages = useMemo(() => {
    const langs = projects.map((p) => p.language).filter(Boolean) as string[];
    return [...new Set(langs)].sort();
  }, [projects]);

  // Reset to page 1 whenever the user changes any filter/sort/search
  useEffect(() => {
    setPage(0);
  }, [search, lang, minScore, minStars, genreFilter, shizukuFilter, activeDays, showGeneric, sort, sortDir]);

  const filtered = useMemo(() => {
    let list = projects;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (lang !== "all") list = list.filter((p) => p.language === lang);
    if (genreFilter !== "all") list = list.filter((p) => p.genre === genreFilter);
    if (shizukuFilter === "shizuku") list = list.filter((p) => p.shizuku);
    if (shizukuFilter === "non-shizuku") list = list.filter((p) => !p.shizuku);
    if (minScore !== "all") list = list.filter((p) => p.score >= Number(minScore));
    if (minStars !== "all") list = list.filter((p) => p.stars >= Number(minStars));
    if (!showGeneric) list = list.filter((p) => !p.is_generic);
    if (activeDays !== "all") {
      list = list.filter((p) => {
        const days = (1 - p.score_breakdown.recency) * 90;
        return days <= Number(activeDays);
      });
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sort === "newest")
        return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      if (sort === "stars") return dir * (a.stars - b.stars);
      if (sort === "recency") return dir * (a.score_breakdown.recency - b.score_breakdown.recency);
      if (sort === "abandonment") return dir * (a.abandonment_risk - b.abandonment_risk);
      return dir * (a.score - b.score);
    });
  }, [projects, lang, minScore, minStars, genreFilter, shizukuFilter, activeDays, search, sort, sortDir, showGeneric]);

  const hasActiveFilters =
    search ||
    lang !== "all" ||
    minScore !== "all" ||
    minStars !== "all" ||
    genreFilter !== "all" ||
    shizukuFilter !== "all" ||
    activeDays !== "all" ||
    !showGeneric ||
    sort !== "score" ||
    sortDir !== "desc";

  return (
    <section id="archive" className="py-24 md:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="calibration-marks w-8" />
            <span
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "var(--color-text-dim)" }}
            >
              Section 03 / Full Archive
            </span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 serif-display"
            style={{ color: "var(--color-text)" }}
          >
            Everything we're tracking
          </h2>
          <p
            className="text-base max-w-xl leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            The complete OSS catalog with all filters and sort options. Scores are
            mechanical health signals (recency, momentum, issue activity, contributors,
            license, abandonment risk).
          </p>
        </div>

        {/* Collapse toggle */}
        <div
          className="glass mb-8"
          style={{ boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)" }}
        >
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand archive" : "Collapse archive"}
            className="w-full flex items-center justify-between p-5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            style={{ color: "var(--color-text)" }}
          >
            <span>{collapsed ? `Archived Instruments (${projects.length})` : "Collapse Archive"}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 200ms ease",
              }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              {/* Controls */}
              <div className="glass mb-8 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="status-dot" />
                  <span
                    className="font-mono text-[10px] tracking-[0.2em] uppercase"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Instrument Controls
                  </span>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        startTransition(() => {
                          setSearch("");
                          setLang("all");
                          setMinScore("all");
                          setMinStars("all");
                          setGenreFilter("all");
                          setShizukuFilter("all");
                          setActiveDays("all");
                          setSort("score");
                          setSortDir("desc");
                          setShowGeneric(true);
                        });
                      }}
                      className="ml-auto font-mono text-[10px] tracking-wider px-2.5 py-1 border transition-colors"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-text-dim)" }}
                    >
                      RESET
                    </button>
                  )}
                </div>

                <div className="ruled-divider mb-4" />

                {/* Search */}
                <div className="relative mb-4">
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search by name or description..."
                    value={search}
                    onChange={(e) => startTransition(() => setSearch(e.target.value))}
                    className="w-full border py-2 pl-9 pr-4 font-mono text-xs outline-none transition-colors focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]/50"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                    }}
                    aria-label="Search projects by name or description"
                    autoComplete="off"
                    name="search"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3">
                  <OptionChipGroup
                    label="Genre"
                    options={genreOptions}
                    value={genreFilter}
                    onChange={setGenreFilter}
                  />
                  <OptionChipGroup
                    label="Lang"
                    options={[
                      { value: "all", label: "ALL" },
                      ...languages.map((l) => ({ value: l, label: l.toUpperCase() })),
                    ]}
                    value={lang}
                    onChange={setLang}
                  />
                  <div className="flex flex-wrap gap-4">
                    <OptionChipGroup
                      label="Score"
                      options={[
                        { value: "all", label: "ANY" },
                        { value: "0.3", label: "3+" },
                        { value: "0.5", label: "5+" },
                        { value: "0.7", label: "7+" },
                      ]}
                      value={minScore}
                      onChange={setMinScore}
                    />
                    <OptionChipGroup
                      label="Stars"
                      options={[
                        { value: "all", label: "ANY" },
                        { value: "80", label: "80+" },
                        { value: "500", label: "500+" },
                        { value: "1000", label: "1k+" },
                        { value: "5000", label: "5k+" },
                      ]}
                      value={minStars}
                      onChange={setMinStars}
                    />
                    <OptionChipGroup
                      label="Active"
                      options={[
                        { value: "all", label: "ANY" },
                        { value: "7", label: "7d" },
                        { value: "14", label: "14d" },
                        { value: "30", label: "30d" },
                      ]}
                      value={activeDays}
                      onChange={setActiveDays}
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <OptionChipGroup
                      label="Access"
                      options={[
                        { value: "all", label: "ALL" },
                        { value: "shizuku", label: "SHIZUKU" },
                        { value: "non-shizuku", label: "STANDARD" },
                      ]}
                      value={shizukuFilter}
                      onChange={setShizukuFilter}
                    />
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono text-[10px] tracking-widest uppercase shrink-0"
                        style={{ color: "var(--color-text-dim)" }}
                      >
                        Generic
                      </span>
                      <FilterChip
                        label={showGeneric ? "Showing" : "Hidden"}
                        selected={showGeneric}
                        onClick={() => startTransition(() => setShowGeneric((p) => !p))}
                        ariaLabel={showGeneric ? "Generic apps visible" : "Generic apps hidden"}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center">
                    <OptionChipGroup
                      label="Sort"
                      options={[
                        { value: "score", label: "SCORE" },
                        { value: "stars", label: "STARS" },
                        { value: "newest", label: "NEW" },
                        { value: "recency", label: "ACTIVE" },
                        { value: "abandonment", label: "RISK" },
                      ]}
                      value={sort}
                      onChange={setSort}
                    />
                    <div className="flex items-center gap-1">
                      <FilterChip
                        label="↓ High→Low"
                        selected={sortDir === "desc"}
                        onClick={() => startTransition(() => setSortDir("desc"))}
                        ariaLabel="Sort descending"
                      />
                      <FilterChip
                        label="↑ Low→High"
                        selected={sortDir === "asc"}
                        onClick={() => startTransition(() => setSortDir("asc"))}
                        ariaLabel="Sort ascending"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Results count */}
              <div className="flex items-center gap-3 mb-6">
                <div className="status-dot" />
                <p
                  className="font-mono text-[10px] tracking-widest uppercase"
                  style={{ color: "var(--color-text-dim)" }}
                >
                  {filtered.length} of {projects.length} specimen
                  {projects.length !== 1 ? "s" : ""} shown
                </p>
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div
                  className="flex flex-col items-center gap-4 py-20 text-center glass"
                >
                  <svg
                    aria-hidden="true"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--color-text-dim)" }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                    <path d="M8 11h6" />
                  </svg>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    No specimens match your criteria
                  </p>
                </div>
              ) : (() => {
                const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
                const clampedPage = Math.min(page, totalPages - 1);
                const visible = filtered.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);
                return (
                  <>
                    <div className="flex flex-col gap-2">
                      {visible.map((p, i) => (
                        <ArchiveRow
                          key={p.id}
                          project={p}
                          index={clampedPage * PAGE_SIZE + i}
                          genreMap={genreMap}
                        />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="glass flex items-center justify-between mt-8 p-4">
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
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
