import { NextResponse } from "next/server";
import { getProjects } from "@/lib/data";

const KEY = "pulsaross-tracked";
const MAX_APPS = 300;

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvGet(): Promise<string[] | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${KEY}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { result?: unknown };
    if (typeof body.result !== "string") return [];
    const parsed = JSON.parse(body.result) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return null;
  }
}

async function kvSet(ids: string[]): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const value = encodeURIComponent(JSON.stringify(ids));
    const res = await fetch(`${KV_URL}/set/${KEY}?value=${value}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const ids = await kvGet();
  // ponytail: single-user dashboard, no auth. Vercel KV missing → empty list,
  // client treats tracking as disabled rather than hard-failing.
  return NextResponse.json({ ids: ids ?? [] });
}

export async function PUT(request: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token || request.headers.get("authorization") !== `Bearer ${token}`) {
    // Fail closed: no token configured means no one can write. The public site
    // never PUTs — the watchlist is per-visitor localStorage.
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as { ids?: unknown } | null;
  if (!body || !Array.isArray(body.ids)) {
    return NextResponse.json({ error: "ids must be an array" }, { status: 400 });
  }
  const validIds = new Set(getProjects().projects.map((p) => p.id));
  const ids = [...new Set(body.ids)]
    .filter((x): x is string => typeof x === "string" && validIds.has(x))
    .slice(0, MAX_APPS);
  const ok = await kvSet(ids);
  if (!ok) {
    return NextResponse.json({ error: "storage unavailable" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, ids });
}