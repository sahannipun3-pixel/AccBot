import { test, expect } from "@playwright/test";
import { testSql } from "../helpers/db";

test.describe("Services Catalog & Detail Pages", () => {
  test("Services page renders real database services", async ({ page }) => {
    // Check DB services
    const dbServices = await testSql<{ title: string; slug: string }[]>`
      SELECT title, slug FROM services WHERE is_active = true ORDER BY sort_order ASC
    `;
    expect(dbServices.length).toBeGreaterThan(0);

    await page.goto("/services");
    await page.waitForLoadState("domcontentloaded");

    // Main heading check
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/Services/i);

    // Verify at least the first database service is displayed
    const firstService = dbServices[0];
    await expect(page.locator("body")).toContainText(firstService.title);
  });

  test("Clicking 'View Details' navigates to the correct service detail page", async ({ page }) => {
    await page.goto("/services");
    await page.waitForLoadState("domcontentloaded");

    // Find the first service card's detail link
    const detailLink = page.locator('a[href^="/services/"]').first();
    await expect(detailLink).toBeVisible();

    const targetHref = await detailLink.getAttribute("href");
    expect(targetHref).toBeTruthy();

    await detailLink.click();
    await expect(page).toHaveURL(new RegExp(targetHref!.replace(/\//g, "\\/")));

    // Verify detail page renders with exactly one H1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();

    // Verify no broken images on the detail page
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute("src");
      expect(src).toBeTruthy();
    }
  });
});
