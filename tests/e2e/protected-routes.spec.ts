import { test, expect } from "@playwright/test";
import { loginViaUI, TEST_USER } from "../helpers/auth";

test.describe("Protected Routes and Authorization Guards", () => {
  const protectedPaths = [
    "/profile",
    "/portal/dashboard",
    "/portal/profile",
    "/portal/services",
    "/portal/security",
    "/portal/support",
    "/admin",
    "/expense-tracker",
    "/accounts-web",
  ];

  test.describe("Unauthenticated Access", () => {
    for (const path of protectedPaths) {
      test(`Guest accessing ${path} is redirected to /login`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("domcontentloaded");

        // Verify redirect to login
        await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}|/login`));
        await expect(page.locator("h1")).toContainText(/Welcome Back|Log In/i);
      });
    }
  });

  test.describe("Standard User Permissions", () => {
    test.beforeEach(async ({ page }) => {
      await loginViaUI(page, TEST_USER);
    });

    test("Standard user can access permitted user portal pages", async ({ page }) => {
      const permittedPaths = [
        "/portal/dashboard",
        "/portal/profile",
        "/portal/services",
        "/portal/security",
        "/portal/support",
        "/profile",
      ];

      for (const path of permittedPaths) {
        await page.goto(path);
        await page.waitForLoadState("domcontentloaded");
        await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));
        expect(page.url()).not.toContain("/login");
      }
    });

    test("Standard user is strictly denied access to /admin and redirected to portal", async ({ page }) => {
      await page.goto("/admin");
      await page.waitForLoadState("domcontentloaded");

      // The proxy/middleware must redirect normal users away from /admin to /portal/dashboard
      await expect(page).toHaveURL(/\/portal\/dashboard/, { timeout: 10000 });
      expect(page.url()).not.toContain("/admin");
    });
  });
});
