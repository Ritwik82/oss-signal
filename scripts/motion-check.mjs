import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100", { waitUntil: "networkidle" });

// Mid-scroll tracker transform (should be non-identity, i.e. between 0 and 1)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
await page.waitForTimeout(800);
const midTransform = await page.evaluate(() => {
  const el = document.querySelector(".scroll-tracker div");
  return el ? getComputedStyle(el).transform : null;
});
console.log("mid-scroll tracker transform:", midTransform);

// Archive expand -> rows appear
await page.locator("#archive").scrollIntoViewIfNeeded();
const expandBtn = await page.locator('button[aria-label="Expand archive"]');
console.log("expand archive btn present:", await expandBtn.count() > 0);
await expandBtn.click();
await page.waitForTimeout(700);
const rows = await page.locator("#archive a[href^='/project/']").count();
console.log("archive rows after expand:", rows);

// Pagination next page (archive zone only)
const archiveZone = page.locator("#archive");
const next = archiveZone.getByRole("button", { name: /Next/ });
const hasNext = await next.count() > 0 && await next.isVisible();
if (hasNext) {
  await next.click();
  await page.waitForTimeout(700);
  const rows2 = await page.locator("#archive a[href^='/project/']").count();
  console.log("archive rows page 2:", rows2);
}

// Mobile drawer
const mob = await browser.newContext({ viewport: { width: 375, height: 740 } });
const mp = await mob.newPage();
await mp.goto("http://localhost:3100", { waitUntil: "networkidle" });
await mp.click('button[aria-label="Toggle navigation menu"]');
await mp.waitForTimeout(600);
const drawerState = await mp.evaluate(() => {
  const drawer = document.querySelector("nav .sm\\:hidden.overflow-hidden");
  const link = drawer ? drawer.querySelector('a[href="#archive"]') : null;
  if (!link) return "no #archive link in drawer";
  const r = link.getBoundingClientRect();
  return `#archive link visible: ${r.width > 0 && r.height > 0}`;
});
console.log("mobile drawer:", drawerState);
const works = await mp.evaluate(() => {
  const drawer = document.querySelector("nav .sm\\:hidden.overflow-hidden");
  const link = drawer ? drawer.querySelector('a[href="#archive"]') : null;
  if (!link) return false;
  link.click();
  return true;
});
await mp.waitForTimeout(800);
console.log("drawer link clickable:", works);

await browser.close();
console.log("DONE");