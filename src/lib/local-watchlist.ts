"use client";

import { useSyncExternalStore } from "react";
import type { WatchlistApp } from "./data";

const KEY = "oss-signal-watchlist";
const EVENT = "oss-signal-watchlist-change";

export type LocalEntry = Pick<WatchlistApp, "id" | "name" | "repo" | "genre"> & {
  source: "local";
};

// Local entries lack the enriched fields; merge them as full WatchlistApp
// shapes so all consumers (panel, briefing, exports) can share one merge.
export function toWatchlistApp(l: LocalEntry): WatchlistApp {
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
    staleness: "unknown",
  };
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
      list.every((a, i) => a.id === cached![i].id)
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
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useLocalWatchlist(): LocalEntry[] {
  return useSyncExternalStore(subscribe, read, () => []);
}

// Returns true when the app was added, false when it was removed.
export function toggleLocalWatchlist(entry: LocalEntry): boolean {
  const list = read();
  const exists = list.some((a) => a.id === entry.id);
  const next = exists ? list.filter((a) => a.id !== entry.id) : [...list, entry];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
  return !exists;
}

export function isLocalTracked(id: string): boolean {
  return read().some((a) => a.id === id);
}