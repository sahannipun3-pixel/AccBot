import { test, expect } from "@playwright/test";
import { testSql, cleanupTestUser } from "../helpers/db";
import { TEST_USER, loginViaUI } from "../helpers/auth";

test.describe("Authentication Flows", () => {
  const ephemeralUser = {
    name: "E2E Ephemeral User",
    email: "e2e_test_user@accbot.lk",
    phone: "+94 71 999 8888",
    password: "Password@123",
  };

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await cleanupTestUser(ephemeralUser.email);
  });

  test.afterAll(async () => {
    await cleanupTestUser(ephemeralUser.email);
  });

  test.describe("Sign Up", () => {
    test("Signup form loads and validates required inputs", async ({ page }) => {
      await page.goto("/signup");
      await page.waitForLoadState("domcontentloaded");

      // Verify page elements
      await expect(page.locator("h1")).toContainText(/Create Account|Sign Up/i);

      // Submit empty form
      const submitBtn = page.locator('form button[type="submit"]');
      await submitBtn.click();

      // Check validation error messages
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/Name must be|email|Invalid email|Password must be/i);
    });

    test("Password mismatch triggers validation error", async ({ page }) => {
      await page.goto("/signup");
      await page.waitForLoadState("domcontentloaded");

      await page.locator("#name").fill("John Test");
      await page.locator("#email").fill("mismatch@test.com");
      await page.locator("#password").fill("Secret123!");
      await page.locator("#confirmPassword").fill("DifferentSecret123!");

      await page.locator('form button[type="submit"]').click();

      await expect(page.locator("body")).toContainText(/Passwords do not match/i);
    });

    test("Valid registration creates database record and logs in user", async ({ page }) => {
      await page.goto("/signup");
      await page.waitForLoadState("domcontentloaded");

      await page.locator("#name").fill(ephemeralUser.name);
      await page.locator("#email").fill(ephemeralUser.email);
      await page.locator("#phone").fill(ephemeralUser.phone);
      await page.locator("#password").fill(ephemeralUser.password);
      await page.locator("#confirmPassword").fill(ephemeralUser.password);

      await page.locator('[data-slot="checkbox"]').click();
      await page.locator('form button[type="submit"]').click();

      // Verify redirection to profile or client portal dashboard
      await expect(page).toHaveURL(/\/profile|\/portal/, { timeout: 15000 });

      // Verify user actually exists in the database
      const dbUsers = await testSql<{ id: string; email: string; full_name: string; role: string }[]>`
        SELECT id, email, full_name, role FROM users WHERE email = ${ephemeralUser.email.toLowerCase()} LIMIT 1
      `;
      expect(dbUsers.length).toBe(1);
      expect(dbUsers[0].full_name).toBe(ephemeralUser.name);
      expect(dbUsers[0].role).toBe("user");
    });

    test("Duplicate email registration displays error message", async ({ page }) => {
      // First ensure the test user exists
      await page.goto("/signup");
      await page.waitForLoadState("domcontentloaded");

      await page.locator("#name").fill(ephemeralUser.name);
      await page.locator("#email").fill(ephemeralUser.email);
      await page.locator("#password").fill(ephemeralUser.password);
      await page.locator("#confirmPassword").fill(ephemeralUser.password);
      await page.locator('[data-slot="checkbox"]').click();
      await page.locator('form button[type="submit"]').click();

      await expect(page).toHaveURL(/\/profile|\/portal/, { timeout: 15000 });

      // Now clear cookies and try signing up again with the exact same email
      await page.context().clearCookies();
      await page.goto("/signup");
      await page.waitForLoadState("domcontentloaded");

      await page.locator("#name").fill("Another Name");
      await page.locator("#email").fill(ephemeralUser.email);
      await page.locator("#password").fill(ephemeralUser.password);
      await page.locator("#confirmPassword").fill(ephemeralUser.password);
      await page.locator('[data-slot="checkbox"]').click();
      await page.locator('form button[type="submit"]').click();

      // Should display duplicate account error
      await expect(page.locator("body")).toContainText(/already exists|already registered/i, { timeout: 10000 });
    });
  });

  test.describe("Email Login", () => {
    test("Login page renders correctly", async ({ page }) => {
      await page.goto("/login");
      await page.waitForLoadState("domcontentloaded");

      await expect(page.locator("h1")).toContainText(/Welcome Back|Log In/i);
      await expect(page.locator("#email")).toBeVisible();
      await expect(page.locator("#password")).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("Empty fields display validation errors", async ({ page }) => {
      await page.goto("/login");
      await page.waitForLoadState("domcontentloaded");

      await page.locator('button[type="submit"]').click();
      const body = await page.locator("body").innerText();
      expect(body).toMatch(/Invalid email|Password must be/i);
    });

    test("Invalid credentials display error alert", async ({ page }) => {
      await page.goto("/login");
      await page.waitForLoadState("domcontentloaded");

      await page.locator("#email").fill("nonexistent_user_xyz@accbot.lk");
      await page.locator("#password").fill("WrongPassword123!");
      await page.locator('button[type="submit"]').click();

      await expect(page.locator("body")).toContainText(/Invalid email or password/i, { timeout: 10000 });
    });

    test("Successful login redirects to portal and persists on refresh", async ({ page }) => {
      await loginViaUI(page, TEST_USER);

      // Verify portal dashboard loaded
      await expect(page).toHaveURL(/\/portal\/dashboard/);

      // Refresh page and ensure session persists
      await page.reload();
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/\/portal\/dashboard/);
      expect(page.url()).not.toContain("/login");
    });
  });

  test.describe("Logout and Session Destruction", () => {
    test("Logging out destroys session and blocks access to protected pages", async ({ page }) => {
      await loginViaUI(page, TEST_USER);

      // In portal, click sign out button in sidebar
      const logoutBtn = page.locator('aside button[title="Sign out"], button[title="Sign out"], button:has-text("Sign out"):visible, button:has-text("Log out"):visible').first();
      await expect(logoutBtn).toBeVisible({ timeout: 10000 });
      await logoutBtn.click();

      // Verify redirected to login
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

      // Attempt to navigate back to /portal/dashboard
      await page.goto("/portal/dashboard");
      await page.waitForLoadState("domcontentloaded");

      // Verify redirected to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Password Reset Flow", () => {
    test("Forgot password page accepts email and displays success confirmation", async ({ page }) => {
      await page.goto("/forgot-password");
      await page.waitForLoadState("domcontentloaded");

      await expect(page.locator("h1")).toContainText(/Forgot Password|Reset/i);

      // Test invalid email
      await page.locator("#email").fill("invalid-email");
      await page.locator('button[type="submit"]').click();
      await expect(page.locator("body")).toContainText(/Invalid email/i);

      // Test valid submission
      await page.locator("#email").fill(TEST_USER.email);
      await page.locator('button[type="submit"]').click();

      // Verify confirmation screen
      await expect(page.locator("body")).toContainText(/Reset Email Sent|instructions/i, { timeout: 10000 });
    });
  });
});
