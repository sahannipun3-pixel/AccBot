import { test, expect } from "@playwright/test";
import { loginViaUI, TEST_USER } from "../helpers/auth";

test.describe("Client User Portal", () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page, TEST_USER);
  });

  const portalPages = [
    { path: "/portal/dashboard", title: /Dashboard|Overview/i },
    { path: "/portal/profile", title: /Profile|Personal/i },
    { path: "/portal/services", title: /Services|Corporate Services/i },
    { path: "/portal/security", title: /Security|Password/i },
    { path: "/portal/support", title: /Support|Help|Consultation/i },
  ];

  for (const p of portalPages) {
    test(`Portal page renders cleanly: ${p.path}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await page.goto(p.path);
      await page.waitForLoadState("domcontentloaded");

      // Verify URL
      await expect(page).toHaveURL(new RegExp(p.path.replace(/\//g, "\\/")));

      // Verify portal heading or main content exists
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible();

      // Verify user portal shell is present
      await expect(page.locator("aside, nav").first()).toBeVisible();

      // Check no fatal error text
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toContain("Internal Server Error");
      expect(bodyText).not.toContain("Application error: a client-side exception");

      // Verify zero critical console exceptions
      const criticalErrors = consoleErrors.filter(
        (e) => !e.includes("ResizeObserver") && !e.includes("hydration")
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }

  test("Portal sidebar navigation successfully navigates between modules", async ({ page }) => {
    await page.goto("/portal/dashboard");
    await page.waitForLoadState("domcontentloaded");

    // Click My Profile in sidebar
    await page.locator('aside a[href="/portal/profile"], nav a[href="/portal/profile"]').first().click();
    await expect(page).toHaveURL(/\/portal\/profile/);

    // Click Services in sidebar
    await page.locator('aside a[href="/portal/services"], nav a[href="/portal/services"]').first().click();
    await expect(page).toHaveURL(/\/portal\/services/);

    // Click Support in sidebar
    await page.locator('aside a[href="/portal/support"], nav a[href="/portal/support"]').first().click();
    await expect(page).toHaveURL(/\/portal\/support/);
  });

  test("Authenticated finance tools load successfully", async ({ page }) => {
    // Expense Tracker
    await page.goto("/expense-tracker");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/expense-tracker/);
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Accounts Web Ledger
    await page.goto("/accounts-web");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/\/accounts-web/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
