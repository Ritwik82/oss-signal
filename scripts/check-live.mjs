import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const url = process.argv[2] ?? "https://oss-signal.vercel.app";
const watchlist = JSON.parse(readFileSync("data/watchlist.json", "utf-8"));
const projects = JSON.parse(readFileSync("data/projects.json", "utf-8"));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(url, { waitUntil: "networkidle" });
const body = await page.evaluate(() => document.body.innerText);
const has = (t) => body.toLowerCase().includes(t.toLowerCase());

const results = {
  "Home loads": (await page.title()).length > 0,
  "Zone: Watchlist h2": has("Apps you rely on"),
  "Zone: Fresh Finds h2": has("New & actively maintained"),
  "Zone: Archive h2": has("Every tracked specimen"),
  "Watchlist: ObtainX shown": has("ObtainX"),
  "Watchlist: Shizuku shown": has("Shizuku"),
  "Watchlist: Termux shown": has("Termux"),
  "Fresh Finds: ObtainX top scorer": has("librefind") || has("OeffiSounds"),
  "Shizuku badge present": has("SHIZUKU"),
  "Genre labels present": ["Media", "Utility", "Productivity", "Security", "Customization"].some((g) => has(g)),
  "Abandonment shown (Device Info HW)": has("Device Info HW"),
  "Console errors": errors.length === 0 ? "PASS (0)" : errors.length,
};

console.log("=== LIVE SITE CHECK: " + url + " ===");
for (const [k, v] of Object.entries(results)) console.log(`${v ? "PASS" : "FAIL"}  ${k} → ${v}`);

const first = projects.projects[0];
await page.goto(`${url}/project/${first.id.replace("/", "%2F")}`, { waitUntil: "domcontentloaded" });
const detail = await page.evaluate(() => document.body.innerText);
console.log(`${detail.includes(first.name) ? "PASS" : "FAIL"}  Project detail page: ${first.id} → ${page.url()}`);
console.log(`${detail.toLowerCase().includes("Health Assessment".toLowerCase()) ? "PASS" : "FAIL"}  Score breakdown section present`);

if (errors.length > 0) console.log("ERRORS:", errors.slice(0, 5));
await browser.close();

