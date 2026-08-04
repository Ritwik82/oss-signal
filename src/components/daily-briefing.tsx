"use client";

import { useEffect, useState } from "react";
import type { WatchlistApp, Project } from "@/lib/data";
import { RelativeTime } from "./relative-time";

const DAY_KEY = "oss-signal-briefing-day";
const PIN_KEY = "oss-signal-briefing-pinned";
const VISIT_KEY = "oss-signal-last-visit";

export function DailyBriefing({
  apps,
  projects,
  generatedAt,
}: {
  apps: WatchlistApp[];
  projects: Project[];
  generatedAt: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [newSinceVisit, setNewSinceVisit] = useState(0);

  useEffect(() => {
    setMounted(true);
    setPinned(localStorage.getItem(PIN_KEY) === "1");
    if (localStorage.getItem(DAY_KEY) !== new Date().toDateString()) {
      localStorage.setItem(DAY_KEY, new Date().toDateString());
    } else {
      setHidden(true);
    }

    const lastVisit = Number(localStorage.getItem(VISIT_KEY) || 0);
    const cutoff = lastVisit || Date.now();
    setNewSinceVisit(
      projects.filter((p) => {
        const t = p.created_at ? new Date(p.created_at).getTime() : 0;
        return t > cutoff;
      }).length
    );
    localStorage.setItem(VISIT_KEY, String(Date.now()));
  }, [projects]);

  if (!mounted) return null;

  const attention = apps.filter(
    (a) => a.staleness === "stale" || a.staleness === "abandoned" || a.staleness === "warning"
  ).length;
  const updates = apps.filter((a) => a.update_available).length;
  const refreshedThisWeek = apps.filter(
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
  if (facts.length === 0) facts.push("Everything is up to date. Nothing needs you today.");

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
