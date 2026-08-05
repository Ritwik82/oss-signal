import { NextResponse } from "next/server";

const SAFE_REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const CACHE_TTL = 60 * 60 * 1000;
const FAIL_TTL = 5 * 60 * 1000;
const MAX_REPOS = 40;
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 1000;

interface RepoFacts {
  latest_tag: string | null;
  released_at: string | null;
}

const cache = new Map<
  string,
  { data: RepoFacts | null; etag?: string; fetchedAt: number }
>();

const hits = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 10000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW)) hits.delete(key);
    }
  }
  const window = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW);
  if (window.length >= RATE_LIMIT) {
    hits.set(ip, window);
    return false;
  }
  window.push(now);
  hits.set(ip, window);
  return true;
}

async function fetchRepoFacts(repo: string): Promise<RepoFacts | null> {
  const now = Date.now();
  const hit = cache.get(repo);
  if (hit && now - hit.fetchedAt < CACHE_TTL) return hit.data;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "oss-signal",
  };
  if (hit?.etag) headers["If-None-Match"] = hit.etag;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/releases?per_page=1`,
      { headers, cache: "no-store" }
    );
    if (res.status === 304 && hit) {
      cache.set(repo, { ...hit, fetchedAt: now });
      return hit.data;
    }
    if (!res.ok) throw new Error(`github ${res.status}`);
    const etag = res.headers.get("etag") ?? undefined;
    const arr = (await res.json()) as { tag_name?: string; published_at?: string }[];
    const facts: RepoFacts | null = arr[0]
      ? { latest_tag: arr[0].tag_name ?? null, released_at: arr[0].published_at ?? null }
      : null;
    cache.set(repo, { data: facts, etag, fetchedAt: now });
    return facts;
  } catch {
    if (hit) {
      cache.set(repo, { ...hit, fetchedAt: now });
      return hit.data;
    }
    // no cache + failure (rate-limit, network): don't cache, retry on next request
    cache.set(repo, { data: null, fetchedAt: now - CACHE_TTL + FAIL_TTL });
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "rate limit exceeded" }, { status: 429 });
  }
  const repos = (url.searchParams.get("repos") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((r) => SAFE_REPO.test(r));
  if (repos.length === 0) return NextResponse.json({});
  if (repos.length > MAX_REPOS) {
    return NextResponse.json(
      { error: `too many repos; max ${MAX_REPOS}` },
      { status: 400 }
    );
  }
  const out: Record<string, RepoFacts | null> = {};
  await Promise.all(
    repos.map(async (repo) => {
      out[repo] = await fetchRepoFacts(repo);
    })
  );
  return NextResponse.json(out);
}