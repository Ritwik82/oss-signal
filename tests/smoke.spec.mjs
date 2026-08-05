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
  expect(body).toContain("Section 01 / Your Watchlist");
  expect(body).toContain("Section 02 / Fresh Finds");
  expect(body).toContain("Section 03 / Full Archive");
  expect(body).toContain("Shizuku");

  const dark = await page.evaluate(() =>
    document.documentElement.classList.contains("dark")
  );
  expect(dark).toBe(true);

  expect(errors).toEqual([]);
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
