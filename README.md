<p align="center">
  <a href="https://oss-signal.vercel.app">
    <img src="public/icon.svg" width="72" height="72" alt="OSS Signal — wave logo from top-left header" />
  </a>
</p>

<h1 align="center">OSS Signal</h1>

<p align="center">
  Tired of installing a great FOSS app only to find it was abandoned a year ago?<br/>
  This checks that <em>before</em> you install — and keeps an eye on the apps you already use.
</p>

<p align="center">
  <a href="https://oss-signal.vercel.app"><img src="https://img.shields.io/badge/Live-oss--signal.vercel.app-14deb5?style=flat-square" alt="Live" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind-38bdf8?style=flat-square" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vercel-Hobby-000?style=flat-square" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT" />
</p>

<p align="center">
  <a href="https://oss-signal.vercel.app"><strong>oss-signal.vercel.app →</strong></a>
</p>

---

## ✨ What it is

### 📋 Your Watchlist
The apps **you** actually use, checked for:
- 🕒 Staleness — how long since the last push or release
- 🔄 Updates — is there a newer release than your installed version
- ⚠️ Abandonment risk — will this likely go stale soon

### 🌱 Fresh Finds — <em>New & actively maintained</em>
Open-source Android projects launched in the last 9 months:
- ✨ Shizuku customization and utility apps
- 🛠️ Everyday FOSS tools (Termux, media, system utilities)
- 🎛️ Filterable by genre, access, and risk

---

## 📊 Scoring — transparent, not a black box

Each project gets a composite score from **6 mechanical signals**:

| Signal | Weight | Source |
|--------|--------|--------|
| ⏱️ Recency (days since last push) | 24% | GitHub `pushed_at` |
| 📈 Momentum (stars ÷ repo age) | 20% | `stargazers_count` + `created_at` |
| 💬 Issue health (open issues minus open PRs) | 16% | GitHub Issues + Search API |
| 📄 License presence | 8% | `license` field |
| 👥 Contributor count (capped at 20) | 12% | Contributors API |
| 🚨 Abandonment risk | 20% | Days since push + issue response |

Three flags: 🏷️ **Genre**, 🔌 **Shizuku**, 🧩 **Generic** (common ideas need extra proof to surface).

---

## 🚀 Getting started

```bash
npm install
npm run dev
```
Open http://localhost:3000

---

## 🔄 Data refresh

```bash
GITHUB_TOKEN=your_token node scripts/refresh-data.mjs
```
Fetches fresh finds, re-checks watchlist, writes `data/projects.json` + `data/watchlist.json`.  
GitHub Action runs this every 6 hours ⏰

---

## 👤 Watchlist source

Empty by default — you build it in the browser with Track buttons or an Obtainium import. Nothing personal ships in the repo.

---

## ☁️ Deploy

```bash
vercel deploy
```
Or push to GitHub — Vercel deploys automatically ✨

---

## 🧰 Tech stack

- ⚛️ Next.js (App Router) + React
- 🎨 Tailwind CSS
- 🎬 Framer Motion
- ☁️ Vercel Hobby (free)
- 🐙 GitHub REST API
- 🔍 HN Algolia + Reddit

---

<p align="center">
  <sub>Built by <a href="https://github.com/Ritwik82">Ritwik</a> • <a href="https://github.com/Ritwik82/oss-signal">View on GitHub</a> • Scores are automated health signals, not endorsements</sub>
</p>
