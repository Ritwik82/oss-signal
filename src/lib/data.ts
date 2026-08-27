import { readFileSync } from "node:fs";
import { join } from "node:path";

export type GenreId =
  | "customization"
  | "shizuku"
  | "media"
  | "utility"
  | "productivity"
  | "security"
  | "store"
  | "education"
  | "dev-tools"
  | "other";

export interface Genre {
  id: GenreId;
  label: string;
  keywords: string[];
}

export interface GenresData {
  genres: Genre[];
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  created_at: string;
  // F-Droid catalog entry date (epoch → ISO, written by refresh-data).
  // "Fresh since last visit" should use this, not GitHub repo creation.
  added_at?: string | null;
  license_name: string | null;
  contributor_count: number;
  score: number;
  score_breakdown: {
    recency: number;
    momentum: number;
    issue_health: number;
    license: number;
    contributors: number;
    abandonment_risk: number;
  };
  discussion_links: { source: string; url: string }[];
  // New pivot fields
  genre: GenreId;
  genre_label: string;
  shizuku: boolean;
  is_generic: boolean;
  abandonment_risk: number;
  last_release_at: string | null;
  social_mentions: number;
}

export interface ProjectsData {
  generated_at: string;
  // Written by refresh-data.mjs: cutoff for the "launched ≤9 months" promise.
  // Fresh Finds renders projects where added_at AND created_at are ≥ this.
  fresh_cutoff: string;
  projects: Project[];
}

export interface HealthStatus {
  label: string;
  color: string;
  badgeStyle: "fresh" | "warning" | "stale";
}

export function getHealthStatus(score: number, staleness?: string): HealthStatus {
  const scaled = score <= 1 ? score * 10 : score;
  if (staleness === "abandoned" || staleness === "stale" || scaled < 5.0) {
    return { label: "Stalled / At Risk", color: "var(--terracotta)", badgeStyle: "stale" };
  }
  if (staleness === "warning" || scaled < 7.5) {
    return { label: "Slow Release Rate", color: "var(--color-signal-amber)", badgeStyle: "warning" };
  }
  return { label: "Active & Maintained", color: "var(--color-signal-green)", badgeStyle: "fresh" };
}

export interface WatchlistApp {
  id: string;
  name: string;
  genre: GenreId;
  source: string;
  repo: string | null;
  installedVersion: string | null;
  latestVersion: string | null;
  installed: boolean;
  trackOnly: boolean;
  fdroid: boolean;
  // community-derived fields (written by refresh-data)
  pushed_at?: string | null;
  last_release_at?: string | null;
  days_since_push?: number | null;
  staleness?: "fresh" | "warning" | "stale" | "abandoned" | "unknown" | "not_yet_catalogued";
  update_available?: boolean;
  notYetCatalogued?: boolean;
}

export interface WatchlistData {
  generated_at: string;
  note?: string;
  apps: WatchlistApp[];
}

let cachedProjects: ProjectsData | null = null;
let cachedWatchlist: WatchlistData | null = null;
let cachedGenres: GenresData | null = null;

export function getProjects(): ProjectsData {
  if (cachedProjects) return cachedProjects;
  const path = join(process.cwd(), "data", "projects.json");
  cachedProjects = JSON.parse(readFileSync(path, "utf-8")) as ProjectsData;
  return cachedProjects;
}

export function getWatchlist(): WatchlistData {
  if (cachedWatchlist) return cachedWatchlist;
  const path = join(process.cwd(), "data", "watchlist.json");
  cachedWatchlist = JSON.parse(readFileSync(path, "utf-8")) as WatchlistData;
  return cachedWatchlist;
}

export function getGenres(): GenresData {
  if (cachedGenres) return cachedGenres;
  const path = join(process.cwd(), "data", "genres.json");
  cachedGenres = JSON.parse(readFileSync(path, "utf-8")) as GenresData;
  return cachedGenres;
}
