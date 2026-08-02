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
  license_name: string | null;
  contributor_count: number;
  score: number;
  score_breakdown: {
    recency: number;
    momentum: number;
    issue_health: number;
    license: number;
    contributors: number;
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
  projects: Project[];
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
  staleness?: "fresh" | "warning" | "stale" | "abandoned" | "unknown";
  update_available?: boolean;
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

const GENRE_ORDER: GenreId[] = [
  "customization",
  "shizuku",
  "media",
  "utility",
  "productivity",
  "security",
  "store",
  "education",
  "dev-tools",
  "other",
];

export function createGenreClassifier(genres: GenresData) {
  const map = new Map<GenreId, string[]>();
  for (const g of genres.genres) map.set(g.id as GenreId, g.keywords.map((k) => k.toLowerCase()));

  return function classify(description: string, name: string): { id: GenreId; label: string } {
    const text = `${name} ${description}`.toLowerCase();
    for (const id of GENRE_ORDER) {
      const keywords = map.get(id);
      if (!keywords) continue;
      if (keywords.some((kw) => kw && text.includes(kw))) {
        const meta = genres.genres.find((g) => g.id === id);
        return { id, label: meta?.label ?? id };
      }
    }
    const meta = genres.genres.find((g) => g.id === "other");
    return { id: "other", label: meta?.label ?? "Other" };
  };
}
