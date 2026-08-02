import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:3000";
const outDir = "public/art/verification";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
mkdirSync(join(process.cwd(), outDir), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(url, { waitUntil: "networkidle" });

const zones = await page.evaluate(() => {
  const text = (el) => (el ? el.textContent.trim().slice(0, 60) : null);
  return {
    h2s: [...document.querySelectorAll("h2")].map((h) => h.textContent.trim()),
    projectCards: document.querySelectorAll("#fresh-finds a, #specimens a").length,
    freshFinds: document.body.textContent.includes("Fresh Finds"),
    shizuku: document.body.textContent.includes("Shizuku"),
    watchlist: document.body.textContent.includes("Watchlist"),
  };
});

try {
  await page.screenshot({ path: join(process.cwd(), outDir, "artifact-4-pivot-home.png"), fullPage: false });
  await page.screenshot({ path: join(process.cwd(), outDir, "artifact-5-pivot-home-full.png"), fullPage: true });
  console.log("screenshots saved");
} catch (e) {
  console.log("screenshot failed:", e.message.split("\n")[0]);
}

console.log(JSON.stringify(zones, null, 2));
console.log("console errors:", errors.length ? errors : "none");
await browser.close();
