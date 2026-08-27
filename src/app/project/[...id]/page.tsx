import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProjects, getHealthStatus } from "@/lib/data";
import { TrackButton } from "@/components/track-button";

const signalMeta: Record<string, { label: string; dotClass: string }> = {
  recency: { label: "Recency", dotClass: "signal-dot-green" },
  momentum: { label: "Momentum", dotClass: "signal-dot-blue" },
  issue_health: { label: "Issue Health", dotClass: "signal-dot-purple" },
  contributors: { label: "Contributors", dotClass: "signal-dot-orange" },
  license: { label: "License", dotClass: "signal-dot-purple" },
  abandonment_risk: { label: "Abandonment Risk ↓", dotClass: "signal-dot-red" },
};

function barColor(value: number): string {
  if (value >= 0.7) return "var(--color-signal-green)";
  if (value >= 0.4) return "var(--color-signal-amber)";
  return "var(--color-signal-red)";
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const meta = signalMeta[label] || { label: label, dotClass: "" };
  return (
    <div className="relative pl-6 py-3 border-b" style={{ borderColor: "var(--color-ruled)" }}>
      {/* Margin dot */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${meta.dotClass}`} />

      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--color-text-dim)" }}>
          {meta.label}
        </span>
        <span className="font-mono text-xs font-bold" style={{ color: "var(--color-accent)" }}>
          {(value * 10).toFixed(1)}
        </span>
      </div>
      <div
        className="w-full h-1.5 overflow-hidden"
        style={{ backgroundColor: "var(--color-ruled)" }}
      >
        <div
          className="h-full transition-[width] duration-500 breakdown-bar-fill"
          style={{ width: `${value * 100}%`, backgroundColor: barColor(value) }}
        />
      </div>
    </div>
  );
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().projects.map((p) => ({ id: p.id.split("/") }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ id: string[] }>;
}): Promise<Metadata> {
  return params.then(async ({ id: segments }) => {
    const decoded = decodeURIComponent(segments.join("/"));
    const project = getProjects().projects.find((p) => p.id === decoded);
    if (!project) return { title: "Not found" };
    return {
      title: `${project.name} — score ${(project.score * 10).toFixed(1)}/10`,
      description: project.description,
      openGraph: {
        title: `${project.name} — PulsarOss`,
        description: project.description,
        type: "website",
      },
    };
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const { id: segments } = await params;
  const decoded = decodeURIComponent(segments.join("/"));
  const data = getProjects();
  const project = data.projects.find((p) => p.id === decoded);
  if (!project) notFound();

  const whyThis =
    project.score >= 0.7
      ? "This specimen scores highly across all health signals — active development, strong community engagement, and good issue management make it worth watching."
      : project.score >= 0.4
        ? "Decent health signals with room to grow. Worth keeping in observation as the community matures."
        : "Early-stage or lower activity — could be a hidden gem or just getting started.";

  const alternatives = data.projects
    .filter((p) => p.id !== project.id && p.genre === project.genre && p.score >= 0.65)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div id="main-content" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 scroll-mt-24">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 font-mono text-[10px] tracking-widest uppercase flex items-center gap-2" style={{ color: "var(--color-text-dim)" }}>
        <Link href="/" className="hover:text-[var(--color-accent)] transition-colors">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/#archive" className="hover:text-[var(--color-accent)] transition-colors">Archive</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" style={{ color: "var(--color-text)" }}>{project.name}</span>
      </nav>
      {/* Back link */}
      <Link
        href="/"
        className="font-mono text-[10px] tracking-widest uppercase mb-8 inline-flex items-center gap-2 transition-colors"
        style={{ color: "var(--color-text-dim)" }}
      >
        ← Back to archive
      </Link>

      {/* Header */}
      <header className="mb-10">
        {/* Stable identifier */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="font-mono text-[10px] tracking-[0.15em] uppercase"
            style={{ color: "var(--color-text-dim)" }}
          >
            {project.owner}/{project.name}
          </span>
          <div className="ruled-divider flex-1" />
        </div>

        {/* Owner */}
        <p
          className="font-mono text-xs mb-1"
          style={{ color: "var(--color-text-dim)" }}
        >
          {project.owner}
        </p>

        {/* Name */}
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight scroll-mt-24 mb-4 serif-display"
          style={{ color: "var(--color-text)" }}
        >
          {project.name}
        </h1>

        {/* Description */}
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          {project.description || (
            <>
              No upstream description — see{" "}
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2" style={{ color: "var(--color-accent)" }}>
                GitHub README
              </a>
              .
            </>
          )}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          {project.language && (
            <span className="flex items-center gap-1.5 font-medium" style={{ color: "var(--color-text)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
              {project.language}
            </span>
          )}
          <span className="font-mono" style={{ color: "var(--color-text-muted)" }}>
            ★ {project.stars.toLocaleString()}
          </span>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono underline underline-offset-2 decoration-accent/50 transition-colors hover:opacity-80"
            style={{ color: "var(--color-accent)" }}
          >
            GitHub ↗
          </a>
          <a
            href={`obtainium://add/${project.url}`}
            className="font-mono text-[11px] inline-flex items-center gap-1 px-2.5 py-1 border transition-colors hover:opacity-80"
            style={{
              color: "var(--color-accent)",
              borderColor: "var(--color-accent-border)",
              backgroundColor: "var(--color-accent-dim)",
            }}
            title="Open & track in Obtainium Android app"
          >
            Obtainium 📲
          </a>
          <TrackButton project={project} />
        </div>
      </header>

      {/* Score panel */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="status-dot" />
          <h2
            className="font-mono text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Health Assessment
          </h2>
        </div>

        <div
          className="glass relative p-6"
          style={{ boxShadow: "var(--card-shadow)" }}
        >
          {/* Corner marks */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "var(--color-accent)" }} />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: "var(--color-accent)" }} />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: "var(--color-accent)" }} />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "var(--color-accent)" }} />

          {/* Score display */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--color-text-dim)" }}>
                Composite Score
              </p>
              <p className="text-4xl font-bold font-mono accent-text">
                {(project.score * 10).toFixed(1)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] tracking-widest uppercase mb-1" style={{ color: "var(--color-text-dim)" }}>
                Status
              </p>
              {(() => {
                const health = getHealthStatus(project.score);
                return (
                  <span
                    className="font-mono text-xs font-bold px-2 py-0.5 border"
                    style={{
                      color: health.color,
                      borderColor: health.color,
                      backgroundColor: "var(--color-accent-dim)",
                    }}
                  >
                    {health.label}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Breakdown */}
          <div className="mb-4">
            <p className="font-mono text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--color-text-dim)" }}>
              Signal Breakdown
            </p>
            {Object.entries(project.score_breakdown).map(([k, v]) => (
              <BreakdownBar key={k} label={k} value={v as number} />
            ))}
          </div>
        </div>
      </section>

      {/* Observation note */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="calibration-marks w-6" />
          <h2
            className="font-mono text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "var(--color-text-dim)" }}
          >
            Observation Note
          </h2>
        </div>
        <div
          className="border-l-2 pl-5 py-2"
          style={{ borderColor: "var(--color-margin)" }}
        >
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            {whyThis}
          </p>
        </div>
      </section>

      {/* Active Alternatives */}
      {alternatives.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="calibration-marks w-6" />
            <h2
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "var(--color-text-dim)" }}
            >
              Active Alternatives in {project.genre_label || project.genre}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {alternatives.map((alt) => {
              const altHealth = getHealthStatus(alt.score);
              return (
                <Link
                  key={alt.id}
                  href={`/project/${encodeURIComponent(alt.id)}`}
                  className="glass p-4 border block transition-colors hover:border-[var(--color-accent)]"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <p className="font-mono text-xs font-semibold truncate" style={{ color: "var(--color-text)" }}>
                    {alt.name}
                  </p>
                  <p className="font-mono text-[10px] truncate mb-2" style={{ color: "var(--color-text-dim)" }}>
                    {alt.owner}
                  </p>
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span style={{ color: altHealth.color }}>{(alt.score * 10).toFixed(1)}</span>
                    <span style={{ color: "var(--color-text-muted)" }}>★ {alt.stars}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Discussion links */}
      {project.discussion_links.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-3">
            <div className="calibration-marks w-6" />
            <h2
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "var(--color-text-dim)" }}
            >
              Related Discussions
            </h2>
          </div>
          <ul className="space-y-2">
            {project.discussion_links.map((link, i) => (
              <li key={i}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs inline-flex items-center gap-2 border px-3 py-2 glass transition-colors"
                  style={{
                    color: "var(--color-accent)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  {link.source === "hn" ? "Hacker News" : "Reddit"}
                  <span style={{ color: "var(--color-text-dim)" }}>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
