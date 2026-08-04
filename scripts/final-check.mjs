import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100", { waitUntil: "networkidle" });

const r = await page.evaluate(() => {
  const out = {};
  const railLink = document.querySelector(".left-rail a");
  out.railTooltip = railLink ? railLink.getAttribute("title") : null;
  const briefing = document.querySelector(".briefing");
  out.briefingBlur = briefing ? getComputedStyle(briefing).backdropFilter : null;
  return out;
});
console.log(JSON.stringify(r));

const modalBtn = page.locator("button", { hasText: "How is a score made?" }).first();
console.log("modal btn visible:", await modalBtn.isVisible());
await modalBtn.click();
await page.waitForTimeout(500);
const modal = await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return "no dialog";
  const cs = getComputedStyle(d);
  return `dialog: blur=${cs.backdropFilter !== "none"}, bg=${cs.backgroundColor}`;
});
console.log(modal);
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
const focusBack = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 40));
console.log("focus after esc:", JSON.stringify(focusBack));

await browser.close();
console.log("DONE");