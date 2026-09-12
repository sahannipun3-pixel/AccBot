import { Page, expect } from "@playwright/test";

export const TEST_ADMIN = {
  email: "admin@accbot.com",
  password: "Admin@12345",
  name: "Super Admin",
};

export const TEST_USER = {
  email: "user@accbot.com",
  password: "User@12345",
  name: "Test User",
};

/**
 * Log in a user through the UI form.
 */
export async function loginViaUI(page: Page, credentials = TEST_USER, expectedPath = "/portal/dashboard") {
  await page.goto("/login");
  await page.waitForLoadState("domcontentloaded");

  await page.locator("#email").fill(credentials.email);
  await page.locator("#password").fill(credentials.password);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to expected area or destination
  await expect(page).toHaveURL(new RegExp(expectedPath.replace(/\//g, "\\/")), { timeout: 15000 });
}

/**
 * Log in an admin user through the UI form.
 */
export async function loginAdminViaUI(page: Page) {
  await loginViaUI(page, TEST_ADMIN, "/admin");
}

/**
 * Log out current session via UI.
 */
export async function logoutViaUI(page: Page) {
  // If in portal/admin, click user dropdown or logout button
  const logoutBtn = page.locator('button:has-text("Log out"), button:has-text("Logout"), button:has-text("Sign Out")').first();
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
  } else {
    // Navigate to /api/auth/signout or trigger signout
    await page.goto("/profile");
    const profileLogout = page.locator('button:has-text("Sign Out")').first();
    if (await profileLogout.isVisible()) {
      await profileLogout.click();
    }
  }
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
}
