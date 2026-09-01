"use client";

import { useSyncExternalStore } from "react";
import type { WatchlistApp, Project } from "./data";

const KEY = "pulsaross-watchlist";
const EVENT = "pulsaross-watchlist-change";

export type LocalEntry = Pick<WatchlistApp, "id" | "name" | "repo" | "genre"> & {
  source: "local";
};

// Local entries lack the enriched fields; merge them as full WatchlistApp
// shapes so all consumers (panel, exports) can share one merge.
// FALLBACK ONLY: used when a locally tracked app is not yet in the project catalog.
// Do not use this for apps that exist in the catalog — they should get real
// staleness/last_release_at from the Project data.
export function toWatchlistAppFallback(l: LocalEntry): WatchlistApp {
  return {
    id: l.id,
    name: l.name,
    repo: l.repo,
    genre: l.genre,
    source: "local",
    installedVersion: null,
    latestVersion: null,
    installed: false,
    trackOnly: true,
    fdroid: false,
    staleness: "not_yet_catalogued",
    notYetCatalogued: true,
  };
}

// Derive staleness from abandonment_risk (precomputed from pushed_at using
// linear 14/30/90-day thresholds from refresh-data.mjs computeAbandonmentRisk).
export function stalenessFromAbandonmentRisk(risk: number): "fresh" | "warning" | "stale" | "abandoned" {
  if (risk <= 0) return "fresh";
  if (risk >= 1) return "abandoned";
  if (risk < (30 - 14) / 76) return "warning";
  return "stale";
}

// Build a WatchlistApp from a Project for locally tracked apps that exist in the catalog.
export function watchlistAppFromProject(p: Project): WatchlistApp {
  const staleness = stalenessFromAbandonmentRisk(p.abandonment_risk);
  return {
    id: p.id,
    name: p.name,
    genre: p.genre,
    source: "local",
    repo: p.id,
    installedVersion: null,
    latestVersion: null,
    installed: false,
    trackOnly: true,
    fdroid: false,
    last_release_at: p.last_release_at,
    staleness,
    update_available: false,
    notYetCatalogued: false,
  };
}

// Merge server watchlist with local tracking, enriching local entries from
// the project catalog when available.
export function mergeWatchlist(
  apps: WatchlistApp[],
  local: LocalEntry[],
  projects: Project[]
): WatchlistApp[] {
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const byKey = new Map<string, WatchlistApp>();
  for (const a of apps) byKey.set(a.repo ?? a.id, a);
  for (const l of local) {
    const key = l.repo ?? l.id;
    if (byKey.has(key)) continue;
    const project = projectById.get(key);
    byKey.set(key, project ? watchlistAppFromProject(project) : toWatchlistAppFallback(l));
  }
  return [...byKey.values()];
}

// getSnapshot must return a stable reference between renders unless the
// store actually changed (React throws an infinite-loop error otherwise).
let cached: LocalEntry[] | null = null;

function read(): LocalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const next = JSON.parse(localStorage.getItem(KEY) ?? "[]") as LocalEntry[];
    const list = Array.isArray(next) ? next : [];
    if (
      cached &&
      list.length === cached.length &&
      list.every(
        (a, i) =>
          a.id === cached![i].id &&
          a.name === cached![i].name &&
          a.repo === cached![i].repo &&
          a.genre === cached![i].genre
      )
    ) {
      return cached;
    }
    cached = list;
    return cached;
  } catch {
    return cached ?? [];
  }
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) {
      cached = null;
      cb();
    }
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLocalWatchlist(): LocalEntry[] {
  return useSyncExternalStore(subscribe, read, () => []);
}

function safeSave(next: LocalEntry[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
    return true;
  } catch (err) {
    console.error("Storage write failed:", err);
    return false;
  }
}

// Returns true when the app was added, false when it was removed.
export function toggleLocalWatchlist(entry: LocalEntry): boolean {
  const list = read();
  const exists = list.some((a) => a.id === entry.id);
  const next = exists ? list.filter((a) => a.id !== entry.id) : [...list, entry];
  if (safeSave(next)) {
    return !exists;
  }
  return false;
}

export function addStarterPack(entries: LocalEntry[]): number {
  const list = read();
  const existing = new Set(list.map((a) => a.id));
  const toAdd = entries.filter((e) => !existing.has(e.id));
  if (toAdd.length === 0) return 0;
  const next = [...list, ...toAdd];
  if (safeSave(next)) {
    return toAdd.length;
  }
  return 0;
}

export function isLocalTracked(id: string): boolean {
  return read().some((a) => a.id === id);
}

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

// Imports an Obtainium JSON export into the visitor's local watchlist.
// Returns the number of apps actually added (deduped against existing entries).
export async function importObtainiumExport(file: File): Promise<number> {
  if (file.size > MAX_IMPORT_BYTES) {
    throw new Error("That file is too large — pick an export under 5 MB.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  const asRecord = parsed as Record<string, unknown> | null;
  let raw: unknown[] = [];
  if (Array.isArray(parsed)) {
    raw = parsed;
  } else if (asRecord && Array.isArray(asRecord.apps)) {
    raw = asRecord.apps as unknown[];
  } else if (asRecord && Array.isArray(asRecord.installedApps)) {
    raw = asRecord.installedApps as unknown[];
  } else if (asRecord && Array.isArray(asRecord.appList)) {
    raw = asRecord.appList as unknown[];
  }

  if (raw.length > 500) {
    throw new Error("That file contains too many apps (maximum 500 allowed).");
  }
  const existing = new Set(read().map((l) => l.id));
  const added: LocalEntry[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const rec = entry as Record<string, unknown>;
    const id = typeof rec.id === "string" && rec.id ? rec.id : rec.packageName;
    if (typeof id !== "string" || !id) continue;
    if (existing.has(id) || added.some((a) => a.id === id)) continue;
    const name = typeof rec.name === "string" && rec.name ? rec.name : id;
    const repo =
      typeof rec.repo === "string" && /^[\w.-]+\/[\w.-]+$/.test(rec.repo)
        ? rec.repo
        : null;
    added.push({ id, name, repo, genre: "other", source: "local" });
  }

  if (added.length === 0) return 0;
  if (safeSave([...read(), ...added])) {
    return added.length;
  }
  return 0;
}
