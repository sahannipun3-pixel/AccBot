import { test, expect } from "@playwright/test";

test.describe("Google Authentication Integration", () => {
  test("Continue with Google initiates valid OAuth 2.0 redirection", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const googleBtn = page.locator('button:has-text("Continue with Google")');
    await expect(googleBtn).toBeVisible();

    // Listen for redirection request to Google OAuth endpoint
    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes("accounts.google.com/o/oauth2"), { timeout: 15000 }),
      googleBtn.click(),
    ]);

    const url = new URL(request.url());
    expect(url.hostname).toBe("accounts.google.com");
    expect(url.pathname).toBe("/o/oauth2/v2/auth");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toContain("email");
    expect(url.searchParams.get("redirect_uri")).toContain("/auth/callback");
    expect(url.searchParams.get("client_id")).toBeTruthy();
  });

  test("Google Sign-In button is also present on signup page", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("domcontentloaded");

    const googleBtn = page.locator('button:has-text("Continue with Google")');
    await expect(googleBtn).toBeVisible();
  });

  test("Google OAuth callback route handles errors and redirects gracefully", async ({ page }) => {
    // When Google redirects back with an error or user cancels
    await page.goto("/auth/callback?error=access_denied");
    await page.waitForLoadState("domcontentloaded");

    // Must redirect to /login with error query param
    await expect(page).toHaveURL(/\/login\?error=/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("Google OAuth callback handles missing code gracefully", async ({ page }) => {
    await page.goto("/auth/callback");
    await page.waitForLoadState("domcontentloaded");

    // Missing code should redirect to login with error parameter
    await expect(page).toHaveURL(/\/login\?error=/);
  });
});
