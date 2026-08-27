// ==UserScript==
// @name         PulsarOss — GitHub Health Badge
// @namespace    https://pulsaross.vercel.app/
// @version      1.1.0
// @description  Shows PulsarOss health scores on GitHub repository pages
// @author       Ritwik
// @match        https://github.com/*/*
// @grant        GM_xmlhttpRequest
// @connect      pulsaross.vercel.app
// @run-at       document-idle
// @license      MIT
// @compatible   chrome Tampermonkey, Violentmonkey
// @compatible   firefox Tampermonkey, Greasemonkey, Violentmonkey
// @compatible   userscript ScriptCat
// ==/UserScript==

(function () {
  "use strict";

  const API_BASE = "https://pulsaross.vercel.app/api/score";

  function getOwnerRepo() {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  }

  function fetchScore(owner, repo) {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: `${API_BASE}/${owner}/${repo}`,
        headers: { Accept: "application/json" },
        timeout: 8000,
        onload(res) {
          if (res.status === 200) {
            try { resolve(JSON.parse(res.responseText)); } catch { resolve(null); }
          } else {
            resolve(null);
          }
        },
        onerror() { resolve(null); },
        ontimeout() { resolve(null); },
      });
    });
  }

  function scoreColor(score) {
    if (score >= 0.7) return { bg: "#dafbe1", fg: "#116329", dot: "#1a7f37" };
    if (score >= 0.4) return { bg: "#fff8c5", fg: "#6d5307", dot: "#9a6700" };
    return { bg: "#ddf4ff", fg: "#0550ae", dot: "#0550ae" };
  }

  function injectBadge(project) {
    const heading = document.querySelector("h1");
    if (!heading) return;
    if (document.querySelector('[data-testid="pulsaross-badge"]')) return;

    const score = project.score;
    const colors = scoreColor(score);

    const badge = document.createElement("span");
    badge.setAttribute("data-testid", "pulsaross-badge");
    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: 10px;
      padding: 2px 10px;
      font-size: 12px;
      font-weight: 500;
      line-height: 20px;
      border-radius: 20px;
      background: ${colors.bg};
      color: ${colors.fg};
      vertical-align: middle;
      white-space: nowrap;
      text-decoration: none;
      cursor: default;
    `;
    badge.title = `PulsarOss health score: ${score.toFixed(2)}`;

    const dot = document.createElement("span");
    dot.style.cssText = `
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${colors.dot};
      flex-shrink: 0;
    `;

    const label = document.createElement("span");
    label.textContent = `OSS ${score.toFixed(2)}`;

    badge.appendChild(dot);
    badge.appendChild(label);

    heading.parentElement.insertBefore(badge, heading.nextSibling);
  }

  function injectNotTracked() {
    const heading = document.querySelector("h1");
    if (!heading) return;
    if (document.querySelector('[data-testid="pulsaross-badge"]')) return;

    const badge = document.createElement("span");
    badge.setAttribute("data-testid", "pulsaross-badge");
    badge.style.cssText = `
      display: inline-flex;
      align-items: center;
      margin-left: 10px;
      padding: 2px 10px;
      font-size: 12px;
      font-weight: 500;
      line-height: 20px;
      border-radius: 20px;
      background: #f6f8fa;
      color: #656d76;
      vertical-align: middle;
      white-space: nowrap;
    `;
    badge.textContent = "OSS not tracked";
    badge.title = "This repo is not tracked by PulsarOss yet";

    heading.parentElement.insertBefore(badge, heading.nextSibling);
  }

  async function main() {
    const info = getOwnerRepo();
    if (!info) return;
    if (document.querySelector('[data-testid="pulsaross-badge"]')) return;

    const project = await fetchScore(info.owner, info.repo);
    if (project) {
      injectBadge(project);
    } else {
      injectNotTracked();
    }
  }

  main();
})();
