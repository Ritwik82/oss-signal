import { chromium } from "playwright";

const url = process.env.URL ?? "https://oss-signal.vercel.app";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 2400 } });
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);

const watchlist = page.locator("#watchlist");
const cardCount = await watchlist.locator(".glass.group").count();
const freshFinds = page.locator("#fresh-finds .glass.group");
const freshCount = await freshFinds.count();
const heading = (await watchlist.locator("h2").textContent())?.trim();
const summary = (await watchlist.locator("p").first().textContent())?.trim();

await page.locator("#watchlist").screenshot({ path: "artifacts/watchlist-zone.png" });
await page.screenshot({ path: "artifacts/home-full.png", fullPage: true });

console.log(JSON.stringify({ cardCount, freshCount, heading, summary }, null, 2));
await browser.close();