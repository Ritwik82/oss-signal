"use client";

import { useMemo } from "react";
import type { WatchlistApp, Project } from "@/lib/data";
import { useLocalWatchlist, mergeWatchlist } from "@/lib/local-watchlist";
import { getSuccessor } from "@/lib/successors";

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  // CWE-1236: prefix formula-triggering leading chars so Excel/Sheets treats
  // the cell as text, not an expression. Names come from untrusted repos.
  if (/^[=+\-@]/.test(s)) return `"'${s}"`;
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

function obtainiumJson(apps: WatchlistApp[]): string {
  const exportApps = apps
    .map((a) => {
      const successor = getSuccessor(a.repo ?? a.id);
      const targetRepo = successor ? successor.successor_repo : a.repo;
      if (!targetRepo) return null;
      return {
        id: a.id,
        name: successor ? successor.successor_name : a.name,
        url: `https://github.com/${targetRepo}`,
        author: targetRepo.split("/")[0],
        originalApp: successor ? a.name : undefined,
        superseded: Boolean(successor),
      };
    })
    .filter(Boolean);

  return JSON.stringify({ apps: exportApps }, null, 2);
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
  const local = useLocalWatchlist();
  const all = useMemo(() => mergeWatchlist(watchlist, local, projects), [watchlist, local, projects]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() =>
          download(
            `obtainium-cleaned-${stamp()}.json`,
            obtainiumJson(all),
            "application/json"
          )
        }
        className="font-mono text-[10px] tracking-widest border px-3 py-1.5 transition-colors hover:opacity-80"
        style={{
          color: "var(--color-signal-green)",
          borderColor: "var(--color-signal-green)",
          backgroundColor: "rgba(16,185,129,0.08)",
        }}
        title="Export in Obtainium JSON format with stale apps auto-upgraded to verified spiritual successors"
      >
        Export Cleaned for Obtainium 📲
      </button>
      <button
        onClick={() =>
          download(
            `watchlist-${stamp()}.json`,
            JSON.stringify(all, null, 2),
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
            watchlistCsv(all),
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
