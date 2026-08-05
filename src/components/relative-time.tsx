"use client";

import { useSyncExternalStore } from "react";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return rtf.format(-mins, "minute");
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return rtf.format(-hrs, "hour");
  const days = Math.floor(hrs / 24);
  return rtf.format(-days, "day");
}

function subscribe(callback: () => void) {
  const id = setInterval(callback, 60_000);
  return () => clearInterval(id);
}

export function RelativeTime({ iso }: { iso: string }) {
  // Minute-ticks external store: server renders empty, client fills in after
  // hydration and refreshes each minute — no effect, no hydration mismatch.
  const minute = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60_000),
    () => 0
  );

  return <span translate="no">{minute === 0 ? "" : relativeTime(iso)}</span>;
}
