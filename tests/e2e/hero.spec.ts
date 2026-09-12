import { test, expect } from "@playwright/test";
import { loginViaUI, TEST_USER } from "../helpers/auth";

test.describe("Hero CTA Button Journey", () => {
  test("Guest user clicks 'Get Started' and navigates to signup page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const getStartedCTA = page.locator('section a:has-text("Get Started")').first();
    await expect(getStartedCTA).toBeVisible({ timeout: 10000 });

    // Click the hero CTA
    await getStartedCTA.click();

    // Verify it navigates to the intended signup onboarding journey
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator("h1")).toContainText(/Create.*Account|Sign Up/i);
  });

  test("Secondary hero CTA navigates to /services", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const exploreServicesBtn = page.locator('section a:has-text("Explore Services")').first();
    await expect(exploreServicesBtn).toBeVisible();
    await exploreServicesBtn.click();

    await expect(page).toHaveURL(/\/services/);
    await expect(page.locator("h1")).toContainText(/Services/i);
  });

  test("Logged-in user sees personalized CTA leading to portal dashboard", async ({ page }) => {
    // Log in as standard test user
    await loginViaUI(page, TEST_USER);

    // Return to home page
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const portalCTA = page.locator('section a:has-text("Go to Client Portal")').first();
    await expect(portalCTA).toBeVisible({ timeout: 10000 });
    await portalCTA.click();

    await expect(page).toHaveURL(/\/portal\/dashboard/);
  });
});
