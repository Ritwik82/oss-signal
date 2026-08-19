"use client";

import { useLocalWatchlist, toggleLocalWatchlist } from "@/lib/local-watchlist";
import type { Project } from "@/lib/data";

export function TrackButton({ project }: { project: Project }) {
  const local = useLocalWatchlist();
  const tracked = local.some((l) => l.id === project.id);
  return (
    <button
      onClick={() =>
        toggleLocalWatchlist({
          id: project.id,
          name: project.name,
          repo: project.id,
          genre: project.genre,
          source: "local",
        })
      }
      aria-pressed={tracked}
      aria-label={tracked ? `Stop tracking ${project.name}` : `Track ${project.name}`}
      className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-colors hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      style={{
        color: tracked ? "var(--color-signal-green)" : "var(--color-accent)",
        borderColor: tracked ? "var(--color-signal-green)" : "var(--color-accent-border)",
        backgroundColor: tracked ? "transparent" : "var(--color-accent-dim)",
      }}
    >
      {tracked ? "TRACKED" : "TRACK"}
    </button>
  );
}