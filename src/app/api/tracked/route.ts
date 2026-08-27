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

// ponytail: same window as /api/score, separate bucket to avoid cross-contamination
const getBuckets = new Map<string, { count: number; reset: number }>();
const PUT_BUCKETS = new Map<string, { count: number; reset: number }>();
function hit(bucket: Map<string, { count: number; reset: number }>, ip: string, max: number): boolean {
  const now = Date.now();
  const b = bucket.get(ip);
  if (!b || now > b.reset) {
    bucket.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  if (b.count >= max) return true;
  b.count++;
  return false;
}

function reqId(request: Request): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}
function err(status: number, error: string, code: string, id: string, extra?: Record<string, string>) {
  return NextResponse.json({ error, code, requestId: id }, { status, headers: { "x-request-id": id, ...extra } });
}

export async function GET(request: Request) {
  const id = reqId(request);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (hit(getBuckets, ip, 60)) {
    return err(429, "rate limited", "RATE_LIMITED", id, { "Retry-After": "60" });
  }
  const ids = await kvGet();
  // ponytail: single-user dashboard, no auth. Vercel KV missing → empty list,
  // client treats tracking as disabled rather than hard-failing.
  return NextResponse.json({ ids: ids ?? [] }, { headers: { "Cache-Control": "private, max-age=0, must-revalidate", "x-request-id": id } });
}

export async function PUT(request: Request) {
  const id = reqId(request);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (hit(PUT_BUCKETS, ip, 10)) {
    return err(429, "rate limited", "RATE_LIMITED", id, { "Retry-After": "60" });
  }
  const token = process.env.ADMIN_TOKEN;
  if (!token || request.headers.get("authorization") !== `Bearer ${token}`) {
    // Fail closed: no token configured means no one can write. The public site
    // never PUTs — the watchlist is per-visitor localStorage.
    return err(403, "unauthorized", "UNAUTHORIZED", id);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err(400, "invalid json", "INVALID_JSON", id);
  }
  if (!body || typeof body !== "object" || !("ids" in body) || !Array.isArray((body as { ids: unknown }).ids)) {
    return err(400, "ids must be an array", "INVALID_PARAM", id);
  }
  const rawIds = (body as { ids: unknown[] }).ids;
  const validIds = new Set(getProjects().projects.map((p) => p.id));
  const ids = [...new Set(rawIds)]
    .filter((x): x is string => typeof x === "string" && validIds.has(x))
    .slice(0, MAX_APPS);
  const ok = await kvSet(ids);
  if (!ok) {
    return err(503, "storage unavailable", "STORAGE_UNAVAILABLE", id);
  }
  return NextResponse.json({ ok: true, ids }, { headers: { "x-request-id": id } });
}