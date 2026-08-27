import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// Usage: node scripts/entrance-probe.mjs <url> <outDir> [--reduced]
// Captures #main-content entrance from FIRST PAINT: an in-page rAF
// sampler logs (t, opacity, transform, animationName) from the moment
// the element exists, plus screenshots at 80ms intervals.
const url = process.argv[2] ?? "https://pulsaross.vercel.app";
const outDir = process.argv[3] ?? "probe-out";
const reduced = process.argv.includes("--reduced");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: reduced ? "reduce" : "no-preference",
});
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await page.goto(url, { waitUntil: "commit" });
await page.evaluate(() => {
  window.__probe = [];
  const start = performance.now();
  function sample() {
    const el = document.querySelector("#main-content");
    if (el) {
      const cs = getComputedStyle(el);
      window.__probe.push({
        t: Math.round(performance.now() - start),
        opacity: cs.opacity,
        transform: cs.transform,
        animationName: cs.animationName,
      });
    }
    if (performance.now() - start < 2000) requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
});

const out = [];
for (let i = 0; i < 6; i++) {
  const t = i * 80;
  await new Promise((r) => setTimeout(r, 80));
  const path = join(outDir, `t${t}ms.png`);
  await page.screenshot({ path });
  out.push(t);
}
const log = await page.evaluate(() => window.__probe);
console.log(JSON.stringify({ screenshots: out, samples: log }, null, 2));
await browser.close();