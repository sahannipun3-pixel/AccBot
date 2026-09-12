import { test, expect } from "@playwright/test";

test.describe("Navigation System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("Desktop navigation links work correctly", async ({ page }) => {
    // Click About
    await page.locator('nav[aria-label="Main Navigation"] a:has-text("About")').click();
    await expect(page).toHaveURL(/\/about/);
    await expect(page.locator("h1")).toContainText(/About|Who We Are|Our Mission/i);

    // Click Services
    await page.locator('nav[aria-label="Main Navigation"] a:has-text("Services")').click();
    await expect(page).toHaveURL(/\/services/);
    await expect(page.locator("h1")).toContainText(/Services/i);

    // Click Contact
    await page.locator('nav[aria-label="Main Navigation"] a:has-text("Contact")').click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.locator("h1")).toContainText(/Contact|Get in Touch|Connect With/i);
  });

  test("Logo navigates back to home page", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("domcontentloaded");

    const logo = page.locator('header a[href="/"]').first();
    await logo.click();
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
  });

  test("Header authentication links navigate to login and signup", async ({ page }) => {
    // Login button
    const loginLink = page.locator('header a[href="/login"]').first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("h1")).toContainText(/Welcome Back|Log In/i);

    // Return to home
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Get Started (Signup) button in navbar
    const getStartedLink = page.locator('header a[href="/signup"]').first();
    await expect(getStartedLink).toBeVisible();
    await getStartedLink.click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator("h1")).toContainText(/Create.*Account|Sign Up/i);
  });

  test("Footer navigation links are valid and active", async ({ page }) => {
    const footerLinks = page.locator("footer a");
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);

    // Check specific essential footer links
    const expectedPaths = ["/about", "/services", "/contact", "/privacy", "/terms"];
    for (const p of expectedPaths) {
      const link = page.locator(`footer a[href="${p}"]`).first();
      await expect(link).toBeVisible();
    }
  });

  test("Mobile navigation drawer opens and navigates", async ({ page }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Open sheet menu
    const menuBtn = page.locator('header button[aria-label="Toggle mobile menu"]').first();
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Mobile nav drawer should be visible
    const mobileAboutLink = page.locator('[role="dialog"] a:has-text("About"), div[data-state="open"] a:has-text("About")').first();
    await expect(mobileAboutLink).toBeVisible({ timeout: 5000 });
    await mobileAboutLink.click();

    await expect(page).toHaveURL(/\/about/);
  });
});
