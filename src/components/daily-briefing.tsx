"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { WatchlistApp, Project } from "@/lib/data";
import { useLocalWatchlist, toWatchlistApp } from "@/lib/local-watchlist";
import { RelativeTime } from "./relative-time";

const DAY_KEY = "oss-signal-briefing-day";
const PIN_KEY = "oss-signal-briefing-pinned";
const VISIT_KEY = "oss-signal-last-visit";

const emptySubscribe = () => () => {};

function load(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

export function DailyBriefing({
  apps,
  projects,
  generatedAt,
}: {
  apps: WatchlistApp[];
  projects: Project[];
  generatedAt: string;
}) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [hidden, setHidden] = useState(() => load(DAY_KEY) === new Date().toDateString());
  const [pinned, setPinned] = useState(() => load(PIN_KEY) === "1");
  // Cutoff = previous visit time, or "now" on first-ever visit (→ 0 new finds).
  const [cutoff] = useState(() => Number(load(VISIT_KEY) || 0) || Date.now());

  useEffect(() => {
    localStorage.setItem(DAY_KEY, new Date().toDateString());
    localStorage.setItem(VISIT_KEY, String(Date.now()));
  }, []);

  const local = useLocalWatchlist();
  const allApps = useMemo(() => {
    const byKey = new Map<string, WatchlistApp>();
    for (const a of apps) byKey.set(a.repo ?? a.id, a);
    for (const l of local) if (!byKey.has(l.repo ?? l.id)) byKey.set(l.repo ?? l.id, toWatchlistApp(l));
    return [...byKey.values()];
  }, [apps, local]);

  const newSinceVisit = useMemo(
    () =>
      projects.filter((p) => {
        // Catalog entry date (F-Droid `added`) is what "new since visit" means;
        // fall back to GitHub creation for rows written before the field existed.
        const t = p.added_at
          ? new Date(p.added_at).getTime()
          : p.created_at
            ? new Date(p.created_at).getTime()
            : 0;
        return t > cutoff;
      }).length,
    [projects, cutoff]
  );

  if (!mounted) return null;

  const attention = allApps.filter(
    (a) => a.staleness === "stale" || a.staleness === "abandoned" || a.staleness === "warning"
  ).length;
  const updates = allApps.filter((a) => a.update_available).length;
  const refreshedThisWeek = allApps.filter(
    (a) => a.days_since_push != null && a.days_since_push <= 7
  ).length;

  const hour = new Date().getHours();
  const salutation =
    hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const facts: string[] = [];
  if (attention > 0)
    facts.push(
      `${attention} watchlist ${attention === 1 ? "app" : "apps"} need attention (stale, warning or abandoned).`
    );
  if (updates > 0)
    facts.push(`${updates} update${updates !== 1 ? "s" : ""} ready to install.`);
  if (refreshedThisWeek > 0)
    facts.push(`${refreshedThisWeek} app${refreshedThisWeek !== 1 ? "s" : ""} updated upstream this week.`);
  if (newSinceVisit > 0)
    facts.push(`${newSinceVisit} new fresh ${newSinceVisit !== 1 ? "finds" : "find"} since your last visit.`);
  if (facts.length === 0)
    facts.push(
      allApps.length === 0
        ? "Your watchlist is empty — track apps from Fresh Finds to get health signals."
        : "Everything is up to date. Nothing needs you today."
    );

  if (hidden && !pinned) return null;

  function togglePin() {
    const now = pinned;
    localStorage.setItem(PIN_KEY, now ? "0" : "1");
    setPinned(!now);
  }

  return (
    <section className="briefing glass" aria-label="Daily briefing">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="salutation">{salutation}.</p>
          <p className="briefing-date">{dateStr}</p>
          <ul>
            {facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="briefing-meta">
            Data refreshed <RelativeTime iso={generatedAt} />
          </p>
        </div>
        <div className="briefing-actions">
          <button
            type="button"
            onClick={() => setHidden(true)}
            className="briefing-btn"
          >
            Dismiss for today
          </button>
          <button
            type="button"
            onClick={togglePin}
            aria-pressed={pinned}
            className="briefing-btn"
          >
            {pinned ? "Pinned" : "Pin"}
          </button>
        </div>
      </div>
    </section>
  );
}
