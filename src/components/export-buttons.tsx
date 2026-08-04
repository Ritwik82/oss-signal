"use client";

import type { WatchlistApp, Project } from "@/lib/data";

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function watchlistCsv(apps: WatchlistApp[]): string {
  const header = [
    "name",
    "id",
    "genre",
    "source",
    "repo",
    "installedVersion",
    "latestVersion",
    "installed",
    "trackOnly",
    "fdroid",
    "staleness",
    "daysSincePush",
    "updateAvailable",
  ];
  const rows = apps.map((a) =>
    [
      a.name,
      a.id,
      a.genre,
      a.source,
      a.repo,
      a.installedVersion,
      a.latestVersion,
      a.installed,
      a.trackOnly,
      a.fdroid,
      a.staleness ?? "",
      a.days_since_push ?? "",
      a.update_available ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

export function ExportButtons({
  watchlist,
  projects,
}: {
  watchlist: WatchlistApp[];
  projects: Project[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() =>
          download(
            `watchlist-${stamp()}.json`,
            JSON.stringify(watchlist, null, 2),
            "application/json"
          )
        }
        className="font-mono text-[10px] tracking-widest border px-3 py-1.5 transition-colors hover:opacity-80"
        style={{
          color: "var(--color-accent)",
          borderColor: "var(--color-accent-border)",
          backgroundColor: "var(--color-accent-dim)",
        }}
      >
        Export watchlist JSON
      </button>
      <button
        onClick={() =>
          download(
            `watchlist-${stamp()}.csv`,
            watchlistCsv(watchlist),
            "text/csv"
          )
        }
        className="font-mono text-[10px] tracking-widest border px-3 py-1.5 transition-colors hover:opacity-80"
        style={{
          color: "var(--color-accent)",
          borderColor: "var(--color-accent-border)",
          backgroundColor: "var(--color-accent-dim)",
        }}
      >
        Export watchlist CSV
      </button>
      <button
        onClick={() =>
          download(
            `projects-${stamp()}.json`,
            JSON.stringify(projects, null, 2),
            "application/json"
          )
        }
        className="font-mono text-[10px] tracking-widest border px-3 py-1.5 transition-colors hover:opacity-80"
        style={{
          color: "var(--color-accent)",
          borderColor: "var(--color-accent-border)",
          backgroundColor: "var(--color-accent-dim)",
        }}
      >
        Export projects JSON
      </button>
    </div>
  );
}
