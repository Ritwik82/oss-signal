# OSS Signal — Project Spec (Personal Edition)

A personal dashboard that surfaces interesting/underrated open-source projects, scores them on a transparent health heuristic, and (v1.1) shows that score directly on GitHub via a browser userscript. No paid APIs. No database. Deployed free on Vercel.

---

## Scope decisions (and why)

- **No Firecrawl.** GitHub, Hacker News, and Reddit all expose free, official, read-only JSON endpoints. No scraping needed for v1.
- **No database.** A GitHub Actions cron job fetches + scores data on a schedule and commits a JSON file to the repo. Next.js reads that file at build/request time. This is $0 forever on Vercel's Hobby tier and avoids managing a DB for a personal project.
- **No auth, no multi-user.** It's your dashboard. Keep it simple.

---

## Tech stack

- **Next.js (App Router)** + React
- **Tailwind CSS** for styling
- **Vercel Hobby tier** for hosting (free)
- **GitHub Actions** for the scheduled data-refresh cron (free, 2,000 min/month on a personal repo)
- Data lives as a committed JSON file (`data/projects.json`), not a database

---

## Data sources (all free, official, no scraping)

1. **GitHub REST Search API**
   `https://api.github.com/search/repositories?q=created:>{date}&sort=stars&order=desc`
   — use a personal access token (classic, `public_repo` scope only) as a GitHub Actions secret to get 5,000 req/hr instead of 60.

2. **HN via Algolia's HN Search API** (official, free, no key needed)
   `https://hn.algolia.com/api/v1/search?tags=show_hn` and `story` — use to pull discussion signal for a repo if it's been posted.

3. **Reddit public JSON endpoints** (no auth needed for public read-only)
   `https://www.reddit.com/r/opensource/hot.json?limit=25`
   `https://www.reddit.com/r/programming/hot.json?limit=25`
   — must send a custom `User-Agent` header or Reddit will 429 you. Anonymous rate limit is roughly 60 req/min — comfortably enough for a scheduled job.

---

## Health score (transparent heuristic, not a black box)

Compute per repo, each 0–1 normalized then weighted:

| Signal | Source | Weight |
|---|---|---|
| Recency (days since last push) | `pushed_at` from GitHub API | 0.3 |
| Momentum (stars ÷ repo age in days) | `stargazers_count`, `created_at` | 0.25 |
| Issue health (closed ÷ total issues, last 90 days) | GitHub Issues API | 0.2 |
| Has license | `license` field non-null | 0.1 |
| Contributor count (capped at 20 for scoring) | `/contributors` endpoint, use `Link` header pagination count trick, don't fetch every page | 0.15 |

Store the raw signals alongside the final score so the UI can show a breakdown, not just a number.

---

## Data schema (`data/projects.json`)

```json
{
  "generated_at": "ISO timestamp",
  "projects": [
    {
      "id": "owner/repo",
      "name": "repo",
      "owner": "owner",
      "description": "...",
      "url": "https://github.com/owner/repo",
      "language": "...",
      "stars": 1234,
      "score": 0.82,
      "score_breakdown": { "recency": 0.9, "momentum": 0.7, "issue_health": 0.8, "license": 1, "contributors": 0.6 },
      "discussion_links": [{ "source": "reddit", "url": "..." }, { "source": "hn", "url": "..." }]
    }
  ]
}
```

---

## Pages / routes

- `/` — grid of scored projects. Filters: language, minimum score, "active in last N days". Sort by score or stars.
- `/project/[id]` — detail view: score breakdown, description, discussion links, an auto-written "why this might be worth a look" blurb.
- `/api/score/[owner]/[repo]` — lightweight API route that returns the cached score for one repo (this is what the v1.1 browser userscript will call — no live scraping on request, just reads the committed JSON).

---

## Build phases — mapped to your installed skills

Run these roughly in order. Each phase names the skill(s) that should actually do the work — don't skip straight to code.

**Phase 0 — Docs check**
`context7-mcp` — pull current Next.js App Router and Vercel deployment docs before scaffolding, so the structure matches current best practice rather than possibly-stale training data.

**Phase 1 — Scaffold + data pipeline**
Create the Next.js + Tailwind project. `github-actions-docs` — write the cron workflow (`.github/workflows/refresh-data.yml`) that runs the fetch-and-score script on a schedule (e.g. every 6 hours), writes `data/projects.json`, and commits it back to the repo.

**Phase 2 — Frontend**
`vercel-react-best-practices`, `vercel-composition-patterns` — component structure for the grid/filter/detail views. `vercel-react-view-transitions` — smooth transitions when filtering/sorting the project grid. `web-design-guidelines` — an actual design pass (typography, spacing, color) so it doesn't read as a generic template.

**Phase 3 — Security pass**
`owasp-security` — review the fetch/score script and the API route specifically for: no secrets exposed client-side (the GitHub token must stay a GitHub Actions secret, never bundled into the frontend), safe JSON parsing, and sanitizing any Reddit/HN title or description text before rendering (untrusted user-generated text going into your HTML — an XSS surface if not handled).

**Phase 4 — Deploy**
`deploy-to-vercel`, `vercel-cli-with-tokens` — set up the Vercel project and any env vars. `vercel-optimize` — a pass once it's live to check bundle size and build time on the Hobby tier's limits.

**Phase 5 — Docs & polish**
`writing-guidelines` — pass over the README and any UI copy / auto-generated blurbs. `opensource-guide-coach` — write a CONTRIBUTING.md and a short governance note now, even though this stays private for now — worth having ready if you ever decide to open it up later. (`readme-i18n` — skip for v1, only worth it if you add a language switcher down the line.)

**Phase 6 — Companion userscript (v1.1, optional, do after v1 is live and working)**
`develop-userscripts` — a Tampermonkey/ScriptCat script that, on any `github.com/{owner}/{repo}` page, calls your deployed `/api/score/[owner]/[repo]` and injects a small badge showing the health score.

---

## Secrets / environment

- `GITHUB_TOKEN` — GitHub Actions secret only (classic PAT, `public_repo` scope). Never exposed to the client or committed to the repo.
- No Reddit or HN auth required.

---

## Kickoff prompt — paste this into OpenCode to start

```
Build "OSS Signal" following the spec in oss-signal-spec.md in this repo.
Work through the Build Phases in order (Phase 0 through Phase 5; Phase 6 is optional, do it last).
For each phase, explicitly invoke the skill(s) named in that phase before writing code —
don't skip straight to implementation without checking the skill's guidance first.
Use the data sources, schema, and scoring formula exactly as specified — no Firecrawl,
no database, no auth. Confirm the health score formula and JSON schema with me before
writing the fetch/score script, since that's the core logic everything else depends on.
```
