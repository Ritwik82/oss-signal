import { writeFileSync, mkdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN env var required");
  process.exit(1);
}

const ONLY_FRESH = process.argv.includes("--fresh-only");
const ONLY_WATCHLIST = process.argv.includes("--watchlist-only");

const UA = "oss-signal/1.1";
const LOOKBACK_DAYS_WATCHLIST = 90;
const FRESH_FIND_MIN_AGE_DAYS = 14;
const FRESH_FIND_MAX_AGE_DAYS = 274; // ~9 months

// Existing 5 signals scaled to 0.80, abandonment_risk = new 0.20 weight.
// In score_breakdown, abandonment_risk stores the GUARD (1 − raw risk) so all six
// signals contribute positively to the composite; raw risk lives at p.abandonment_risk.
const SCORE_WEIGHTS = { recency: 0.24, momentum: 0.20, issue_health: 0.16, license: 0.08, contributors: 0.12, abandonment_risk: 0.20 };

const MIN_STARS = 80;

const blocklistPath = join(process.cwd(), "blocklist.json");
const BLOCKED_REPOS = new Set(JSON.parse(readFileSync(blocklistPath, "utf-8")));
const genres = JSON.parse(readFileSync(join(process.cwd(), "data", "genres.json"), "utf-8"));
const watchlist = JSON.parse(readFileSync(join(process.cwd(), "data", "watchlist.json"), "utf-8"));

const BLOCKED_NAME_PATTERNS = [
  /jailbreak/i,
  /unrestrict/i,
  /bypass(?!\.js)/i,
  /spoof/i,
];

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github.v3+json",
  "User-Agent": UA,
};

// Increased rate limit buffer — the timeout is the bottleneck, not the API.
const SEARCH_WINDOW_MS = 60_000;
const SEARCH_MAX = 12;
const searchTimestamps = [];

async function waitSearchSlot() {
  while (true) {
    const now = Date.now();
    while (searchTimestamps.length && searchTimestamps[0] <= now - SEARCH_WINDOW_MS) {
      searchTimestamps.shift();
    }
    if (searchTimestamps.length < SEARCH_MAX) break;
    const wait = searchTimestamps[0] + SEARCH_WINDOW_MS - now + 100;
    console.log(`  search rate limit — waiting ${Math.ceil(wait / 1000)}s...`);
    await new Promise((r) => setTimeout(r, wait));
  }
  searchTimestamps.push(Date.now());
}

async function searchFetch(url, retries = 5) {
  for (let attempt = 0; attempt < retries; attempt++) {
    await waitSearchSlot();
    const res = await fetch(url, { headers });
    if (res.status === 403) {
      const delay = Math.min(3000 * 2 ** attempt, 60_000);
      console.log(`  403 on search API, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${retries})...`);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return res.json();
  }
  throw new Error(`search API 403 after ${retries} retries for ${url}`);
}

const RETRYABLE_CODES = new Set(["ECONNRESET", "ENOTFOUND", "ETIMEDOUT", "EPIPE", "EAI_AGAIN", "ECONNREFUSED"]);

// Shared fetch with retry on flaky-network errors (DNS, resets, timeouts) and 5xx.
// Body read happens inside the loop so mid-download resets (the F-Droid 52MB case) retry too.
// AbortSignal.timeout guarantees a hung socket can't block the run forever.
async function retryFetch(url, { extraHeaders = {}, format = "json", retries = 4, timeoutMs = 60_000 } = {}) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { ...headers, ...extraHeaders }, signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) throw Object.assign(new Error(`${res.status} ${res.statusText} for ${url}`), { httpStatus: res.status });
      if (format === "text") return { text: await res.text(), link: res.headers.get("link") };
      return { json: await res.json(), link: res.headers.get("link") };
    } catch (e) {
      const code = e?.cause?.code ?? e?.code ?? "";
      const retriable = RETRYABLE_CODES.has(code) || code === "ABORT_ERR" || (e?.httpStatus ?? 0) >= 500;
      if (!retriable) throw e;
      if (attempt === retries - 1) throw e;
      const delay = 2000 * 2 ** attempt + 1000;
      console.log(`  network retry ${attempt + 1}/${retries} in ${Math.ceil(delay / 1000)}s (${code || e.message}) for ${url}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("retryFetch exhausted retries");
}

async function fetchJSON(url, extraHeaders = {}) {
  const r = await retryFetch(url, { extraHeaders });
  return r.json;
}

async function fetchWithUA(url, retries = 5) {
  const r = await retryFetch(url, { format: "text", retries, timeoutMs: 300_000 });
  return r.text;
}

function daysSince(iso) {
  return (Date.now() - new Date(iso).getTime()) / 86_400_000;
}

// Compare versions tolerant of format noise: "v13.6.0" == "13.6.0", "2.1.4-beta" vs "2.1.4".
function versionKey(v) {
  return (String(v ?? "").toLowerCase().replace(/^v/, "").match(/\d+/g) ?? []).join(".");
}
function sameVersion(a, b) {
  if (!a || !b) return false;
  return versionKey(a) === versionKey(b) && versionKey(a) !== "";
}

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function scoreRecency(pushedAt) {
  const days = daysSince(pushedAt);
  return clamp(1 - days / 90);
}

function scoreMomentum(stars, createdAt) {
  const age = Math.max(daysSince(createdAt), 1);
  return Math.log10(1 + stars) / Math.log10(1 + age);
}

// Proxy: open_issues_count from the repo object itself — no extra API call.
// Helm: 0 open issues => 1.0; many open issues relative to repo age => lower.
// This avoids the expensive /search/issues calls entirely and is still a
// reasonable maintenance signal.
function scoreIssueHealth(repoData) {
  const openIssues = repoData.open_issues_count ?? 0;
  if (openIssues === 0) return 1.0;
  if (openIssues < 10) return 0.8;
  if (openIssues < 50) return 0.6;
  if (openIssues < 100) return 0.4;
  return 0.2;
}

async function scoreContributors(owner, repo) {
  const r = await retryFetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=false`, { format: "text" });
  const match = r.link?.match(/page=(\d+)>;\s*rel="last"/);
  const count = match ? parseInt(match[1], 10) : (JSON.parse(r.text))?.length ?? 0;
  return { normalized: clamp(Math.min(count, 20) / 20), raw: count };
}

function computeAbandonmentRisk(pushedAt) {
  const days = daysSince(pushedAt);
  if (days < 14) return 0;
  if (days < 30) return (days - 14) / 16;
  if (days < 90) return (days - 14) / 76;
  return 1;
}

async function findDiscussions(owner, repo) {
  const links = [];
  let mentions = 0;
  try {
    const hn = await fetchJSON(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(owner + "/" + repo)}&tags=story`);
    if (hn.hits?.length > 0) {
      links.push({ source: "hn", url: `https://news.ycombinator.com/item?id=${hn.hits[0].objectID}` });
      mentions += hn.hits.length;
    }
  } catch {}
  try {
    for (const sub of ["opensource", "programming", "android", "fossdroid"]) {
      const posts = await fetchJSON(`https://www.reddit.com/r/${sub}/hot.json?limit=25`, { "User-Agent": UA });
      const match = posts?.data?.children?.find(
        (c) => c.data?.url?.includes(`${owner}/${repo}`) || c.data?.selftext?.includes(`${owner}/${repo}`)
      );
      if (match) {
        links.push({ source: "reddit", url: `https://reddit.com${match.data.permalink}` });
        break;
      }
    }
  } catch {}
  return { social_mentions: mentions, links };
}

const GENERIC_PATTERNS = [
  /note/i, /todo/i, /task/i, /pomodoro/i, /timer/i, /calculator/i, /flashcard/i,
  /reminder/i, /habit/i, /expense/i, /weather/i, /sticky/i, /journal/i, /diary/i,
  /grocery/i, /shopping/i, /markdown/i, /editor/i, /checklist/i,
];

function detectGeneric(name, description) {
  const text = `${name} ${description}`;
  return GENERIC_PATTERNS.some((p) => p.test(text));
}

// Claude/agent/MCP skill repos — not Android apps, out of scope.
const IRRELEVANT_REPO_PATTERN = /skill|claude|mcp|agent[- ]?skill|llm[- ]?prompt|prompt[- ]?library|cursor[- ]?rule|copilot/i;

function isRelevantToAndroid(desc, name, topics, language) {
  const text = `${name} ${desc} ${(topics ?? []).join(" ")} ${language ?? ""}`.toLowerCase();
  if (IRRELEVANT_REPO_PATTERN.test(text)) return false;
  // Include if explicitly Android/mobile tagged OR mobile-ish tech stack.
  return (
    /android|apk|fdroid|f-droid|android-app/.test(text) ||
    (language || "").toLowerCase() === "kotlin" ||
    (language || "").toLowerCase() === "kotlin android" ||
    (topics ?? []).some((t) => /android|kotlin|jetpack|fdroid/.test(t.toLowerCase()))
  );
}

function classifyGenre(desc, name) {
  const text = `${name} ${desc}`.toLowerCase();
  for (const g of genres.genres) {
    if (g.id === "other") continue;
    if (g.keywords?.some((kw) => kw && text.includes(kw.toLowerCase()))) {
      return { id: g.id, label: g.label };
    }
  }
  const other = genres.genres.find((g) => g.id === "other");
  return { id: "other", label: other?.label ?? "Other" };
}

function detectShizuku(desc) {
  return /shizuku|adb|xposed|magisk|dhizuku|hiddenapi|privapp|priv-app|write_secure_settings/i.test(`${desc}`.toLowerCase());
}

function isTemplateOrList(desc, name, topics) {
  const d = (desc + " " + name).toLowerCase();
  if (/awesome-[a-z0-9-]+$/.test(d)) return true;
  if (/cs-fundamentals/.test(d)) return true;
  if (/template|boilerplate|starter|scaffold|generator|collection/.test(d) && (topics ?? []).some((t) => t.toLowerCase().includes("awesome"))) return true;
  return false;
}

async function main() {
  const now = new Date().toISOString();
  console.log(`[${now}] Starting OSS Signal refresh`);

  // ─── Watchlist ────────────────────────────────────────────────────────────────
  if (ONLY_FRESH) {
    console.log("\nSkipping watchlist (--fresh-only)");
  } else {
    console.log(`\nRefreshing watchlist (${watchlist.apps.length} apps)...`);
    for (const app of watchlist.apps) {
      if (app.trackOnly || !app.repo) {
        app.pushed_at = null;
        app.last_release_at = null;
        app.days_since_push = null;
        app.staleness = "unknown";
        app.update_available = false;
        continue;
      }
      try {
        const repoData = await fetchJSON(`https://api.github.com/repos/${app.repo}`);
        app.pushed_at = repoData.pushed_at;
        app.days_since_push = Math.round(daysSince(repoData.pushed_at));
        const days = app.days_since_push;
        app.staleness = days < 14 ? "fresh" : days < 30 ? "warning" : days < 90 ? "stale" : "abandoned";
        const release = await fetchJSON(`https://api.github.com/repos/${app.repo}/releases?per_page=1`)
          .then((rs) => rs?.[0] ? { published_at: rs[0].published_at ?? null, tag: rs[0].tag_name ?? null } : null)
          .catch(() => null);
        app.last_release_at = release?.published_at ?? null;
        // Update detection: compare the actual latest GitHub release tag against what's installed.
        // Tags with no parseable version (e.g. "pre-release") leave the state unknown, not "update".
        app.latestVersion = release?.tag ?? app.latestVersion ?? null;
        app.update_available = app.installedVersion && app.latestVersion && versionKey(app.latestVersion)
          ? !sameVersion(app.installedVersion, app.latestVersion)
          : null;
        console.log(`  ${app.name}: ${app.staleness} (${days}d)${app.update_available ? ` — update ${app.installedVersion} → ${app.latestVersion}` : ""}`);
      } catch (e) {
        console.error(`  ERROR ${app.repo}: ${e?.message ?? e}`);
        app.staleness = "unknown";
      }
    }
    writeFileSync(join(process.cwd(), "data", "watchlist.json"), JSON.stringify(watchlist, null, 2));
    console.log(`Wrote ${watchlist.apps.length} watchlist apps to data/watchlist.json`);
  }

  // ─── Fresh Finds (F-Droid) ─────────────────────────────────────────────────────
  if (ONLY_WATCHLIST) {
    console.log("\nSkipping fresh finds (--watchlist-only)");
    return;
  }

  // F-Droid index-v2.json gives us ALL apps, all added dates — no rate limits.
  // 52 MB download — cache to disk for 12h so re-runs are fast and network-safe.
  console.log(`\nFetching fresh finds from F-Droid (last ${FRESH_FIND_MAX_AGE_DAYS}d)...`);
  const fdroidCachePath = join(process.cwd(), ".cache", "fdroid-index-v2.json");
  const FDROID_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

  let fdroidRaw;
  try {
    if (existsSync(fdroidCachePath) && Date.now() - statSync(fdroidCachePath).mtimeMs < FDROID_CACHE_MAX_AGE_MS) {
      console.log("  using cached F-Droid index");
      fdroidRaw = readFileSync(fdroidCachePath, "utf-8");
    } else {
      fdroidRaw = await fetchWithUA("https://f-droid.org/repo/index-v2.json");
      mkdirSync(dirname(fdroidCachePath), { recursive: true });
      writeFileSync(fdroidCachePath, fdroidRaw);
      console.log(`  downloaded + cached ${(fdroidRaw.length / 1024 / 1024).toFixed(1)} MB index`);
    }
  } catch (e) {
    console.error("F-Droid index fetch failed:", e);
    process.exit(1);
  }

  let fdroidParsed;
  try {
    fdroidParsed = JSON.parse(fdroidRaw);
  } catch (e) {
    console.error("F-Droid index JSON parse failed even after cleanup");
    throw e;
  }

  const packages = fdroidParsed?.packages ?? {};
  const cutoffMs = Date.now() - FRESH_FIND_MAX_AGE_DAYS * 86_400_000;

  const fdroidApps = Object.entries(packages)
    .filter(([pkgName, pkg]) => {
      const added = pkg?.metadata?.added ?? 0; // epoch millis
      if (!added) return false;
      return added >= cutoffMs;
    })
    .map(([pkgName, pkg]) => {
      const meta = pkg?.metadata ?? {};
      const name = meta?.name?.["en-US"] ?? (Array.isArray(meta?.name) ? meta.name[0] : null) ?? pkgName;
      const summary = meta?.summary?.["en-US"] ?? (Array.isArray(meta?.summary) ? meta.summary[0] : null) ?? "";
      const license = meta?.license ?? null;
      const source = meta?.sourceCode ?? null; // string URL, not an object
      return { pkgName, name, summary, license, sourceCode: source };
    });

  const freshProjects = [];

  async function scoreFreshApp(app) {
    // Must have a GitHub or GitLab source URL to score
    if (!app.sourceCode) return null;
    const m = app.sourceCode.match(/(github\.com|gitlab\.com)\/(?<owner>[^\/]+)\/(?<repo>[^\s\/]+)/);
    if (!m?.groups?.owner || !m?.groups?.repo) return null;
    const owner = m.groups.owner;
    const name = m.groups.repo;

    const isShizuku = detectShizuku(app.summary + " " + name);
    const { id: genreId, label: genreLabel } = classifyGenre(app.summary, name);
    const isGeneric = detectGeneric(name, app.summary);

    const [repoData, contribResult] = await Promise.all([
      fetchJSON(`https://api.github.com/repos/${owner}/${name}`).catch(() => null),
      scoreContributors(owner, name).catch(() => ({ normalized: 0, raw: 0 })),
    ]);
    if (!repoData) return null;

    const issueScore = scoreIssueHealth(repoData);
    const abandonmentRisk = computeAbandonmentRisk(repoData.pushed_at);    const last_release_at = await fetchJSON(`https://api.github.com/repos/${owner}/${name}/releases?per_page=1`)
      .then((rs) => rs?.[0]?.published_at ?? null)
      .catch(() => null);

    // Social proof for generic or small-star repos only
    const social = (isGeneric || repoData.stargazers_count < 300)
      ? await findDiscussions(owner, name)
      : { social_mentions: 0, links: [] };

    const recency = scoreRecency(repoData.pushed_at);
    const momentumRaw = scoreMomentum(repoData.stargazers_count, repoData.created_at);
    const license = repoData.license?.spdx_id ? 1 : 0;

    return {
      id: `${owner}/${name}`,
      name,
      owner,
      description: app.summary ?? "",
      url: repoData.html_url,
      language: repoData.language ?? "",
      stars: repoData.stargazers_count,
      created_at: repoData.created_at,
      license_name: repoData.license?.spdx_id ?? null,
      contributor_count: contribResult.raw,
      _momentumRaw: momentumRaw,
      score_breakdown: { recency, momentum: 0, issue_health: issueScore, license, contributors: contribResult.normalized, abandonment_risk: 1 - abandonmentRisk },
      discussion_links: social.links,
      genre: genreId,
      genre_label: genreLabel,
      shizuku: isShizuku,
      is_generic: isGeneric,
      abandonment_risk: abandonmentRisk,
      last_release_at,
      social_mentions: social.social_mentions,
    };
  }

  const sourceApps = fdroidApps.filter((a) => a.sourceCode && /(github\.com|gitlab\.com)\/[^\/]+\/[^\s\/]+/.test(a.sourceCode));
  console.log(`  ${sourceApps.length} apps with GitHub/GitLab source — scoring in batches of 5...`);

  const BATCH = 5;
  for (let i = 0; i < sourceApps.length; i += BATCH) {
    const batch = sourceApps.slice(i, i + BATCH);
    const results = await Promise.all(batch.map((app) => scoreFreshApp(app)));
    for (const p of results) if (p) freshProjects.push(p);
    if (i % (BATCH * 5) === 0 || i + BATCH >= sourceApps.length) {
      console.log(`  progress ${Math.min(i + BATCH, sourceApps.length)}/${sourceApps.length} (${freshProjects.length} scored)...`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  const maxMomentum = Math.max(...freshProjects.map((p) => p._momentumRaw), 1);
  for (const p of freshProjects) {
    p.score_breakdown.momentum = clamp(p._momentumRaw / maxMomentum);
    delete p._momentumRaw;
  }

  for (const p of freshProjects) {
    const breakdown = p.score_breakdown;
    p.score = parseFloat(
      Object.entries(SCORE_WEIGHTS)
        .reduce((sum, [k, w]) => sum + (breakdown[k] ?? 0) * w, 0)
        .toFixed(3)
    );
  }

  // Same repo can ship multiple F-Droid packages — keep the highest-scoring entry.
  const byId = new Map();
  for (const p of freshProjects) {
    const prev = byId.get(p.id);
    if (!prev || p.score > prev.score) byId.set(p.id, p);
  }
  const uniqueProjects = [...byId.values()];
  if (uniqueProjects.length < freshProjects.length) {
    console.log(`  deduped ${freshProjects.length - uniqueProjects.length} duplicate repos`);
  }
  freshProjects.length = 0;
  freshProjects.push(...uniqueProjects);

  freshProjects.sort((a, b) => b.score - a.score);

  const dataDir = join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, "projects.json"), JSON.stringify({ generated_at: new Date().toISOString(), projects: freshProjects }, null, 2));
  console.log(`\nWrote ${freshProjects.length} fresh projects to data/projects.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
