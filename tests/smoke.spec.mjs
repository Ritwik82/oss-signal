import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

test("home page renders all three zones", async ({ page }) => {
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const body = await page.textContent("body");
  expect(body).toContain("Apps you rely on");
  expect(body).toContain("New & actively maintained");
  expect(body).toContain("Everything we're tracking");
  expect(body).not.toContain("Section 0");

  const watchlistData = JSON.parse(
    readFileSync(join(process.cwd(), "data", "watchlist.json"), "utf-8")
  );
  expect(watchlistData.apps.length).toBe(0);
  expect(body).toContain("Empty watchlist");

  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(theme).toBe("terminal");

  expect(errors).toEqual([]);
});

test("theme picker switches theme and persists across reload", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const trigger = page.getByRole("button", { name: "Change theme" });
  await trigger.click();
  await page.getByRole("button", { name: "LIGHT", exact: true }).click();
  await page.getByRole("menuitemradio", { name: /Cream/ }).click();

  const theme = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    meta: document.querySelector('meta[name="theme-color"]')?.getAttribute("content"),
  }));
  expect(theme.theme).toBe("cream");
  expect(theme.meta).toBe("#f6eddd");

  await page.reload({ waitUntil: "networkidle" });
  const persisted = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(persisted).toBe("cream");
});

test("fresh card body navigates, TRACK button does not", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const card = page.locator("#fresh-finds .glass.group").first();
  await card.click();
  await page.waitForURL(/\/project\//);
  expect(page.url()).toMatch(/\/project\//);

  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const trackBtn = page.getByRole("button", { name: /^Track / }).first();
  const name = (await trackBtn.getAttribute("aria-label")).replace(/^Track /, "").trim();
  await trackBtn.click();
  await page.waitForTimeout(300);
  expect(page.url()).not.toMatch(/\/project\//);
  await expect(page.locator("#watchlist")).toContainText(name);
});

test("project page renders a real project", async ({ page }) => {
  const data = JSON.parse(
    readFileSync(join(process.cwd(), "data", "projects.json"), "utf-8")
  );
  const p = data.projects[0];
  await page.goto(`/project/${p.id}`, { waitUntil: "networkidle" });

  const body = await page.textContent("body");
  expect(body).toContain(p.name);
  expect(body).toContain(p.owner);
});

test("watchlist collapse toggle works", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const btn = page.getByRole("button", { name: /(collapse|expand) watchlist/i });
  await expect(btn).toHaveCount(1);
  await btn.click();
  await expect(btn).toHaveAttribute("aria-expanded", "false");
});

test("mobile drawer search finds a project", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const data = JSON.parse(
    readFileSync(join(process.cwd(), "data", "projects.json"), "utf-8")
  );
  const p = data.projects[0];

  await page.getByRole("button", { name: "Toggle navigation menu" }).click();
  const drawerSearch = page.getByRole("combobox", {
    name: "Search the whole catalog",
  });
  await expect(drawerSearch).toBeVisible();
  await drawerSearch.fill(p.name.slice(0, 6));
  await page.getByRole("option").first().click();
  await page.waitForURL(/\/project\//);
  await expect(page).toHaveURL(new RegExp(`/project/${encodeURIComponent(p.id)}`));
});

test("track from Fresh Finds adds to watchlist, untrack removes it", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const projects = JSON.parse(
    readFileSync(join(process.cwd(), "data", "projects.json"), "utf-8")
  ).projects;
  const watchlistIds = new Set(
    JSON.parse(readFileSync(join(process.cwd(), "data", "watchlist.json"), "utf-8")).apps.map((a) => a.repo ?? a.id)
  );
  // Seeded apps are "shared" (no untrack button) — track one that isn't seeded.
  const target = [...projects].sort((a, b) => b.score - a.score).find((p) => !watchlistIds.has(p.id));
  const watchlist = page.locator("#watchlist");
  const stopBtn = watchlist.getByRole("button", { name: `Stop tracking ${target.name}` });
  await expect(stopBtn).toHaveCount(0);

  // Find the card by its track button
  const trackBtn = page.locator("#fresh-finds").getByRole("button", { name: `Track ${target.name}` });
  await trackBtn.click();
  await expect(stopBtn).toHaveCount(1);

  await stopBtn.click();
  await expect(stopBtn).toHaveCount(0);
});
