import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProjects } from "@/lib/data";

const signalMeta: Record<string, { label: string; dotClass: string }> = {
  recency: { label: "Recency", dotClass: "signal-dot-green" },
  momentum: { label: "Momentum", dotClass: "signal-dot-blue" },
  issue_health: { label: "Issue Health", dotClass: "signal-dot-purple" },
  contributors: { label: "Contributors", dotClass: "signal-dot-orange" },
  license: { label: "License", dotClass: "signal-dot-pink" },
  abandonment_risk: { label: "Abandonment Risk ↓", dotClass: "signal-dot-red" },
};

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
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
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
        title: `${project.name} — OSS Signal`,
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

  return (
    <div id="main-content" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 scroll-mt-24">
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
          {project.description || "No description provided."}
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
          style={{ boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)" }}
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
              <span
                className="font-mono text-xs font-bold px-2 py-0.5 border"
                style={{
                  color: "var(--color-accent)",
                  borderColor: "var(--color-accent-border)",
                  backgroundColor: "var(--color-accent-dim)",
                }}
              >
                {project.score >= 0.7 ? "HEALTHY" : project.score >= 0.4 ? "MODERATE" : "EARLY"}
              </span>
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
