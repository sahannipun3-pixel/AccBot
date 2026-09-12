import { test, expect } from "@playwright/test";
import { loginViaUI, TEST_USER } from "../helpers/auth";

test.describe("Security & Authorization Invariants", () => {
  test("Standard user attempting /admin is intercepted and redirected", async ({ page }) => {
    await loginViaUI(page, TEST_USER);

    // Attempt direct URL access to /admin
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Must be redirected to client portal
    await expect(page).toHaveURL(/\/portal\/dashboard/, { timeout: 10000 });
    expect(page.url()).not.toContain("/admin");
  });

  test("Setup admin endpoint /api/auth/setup-admin is locked when super_admin exists", async ({ request }) => {
    const res = await request.get("/api/auth/setup-admin?email=hacker@evil.com&password=Password123!");
    // Must return 403 Forbidden because a super_admin already exists
    expect(res.status()).toBe(403);

    const body = await res.json();
    expect(body.error).toContain("already exists");
  });

  test("Token refresh endpoint rejects forged or missing refresh tokens", async ({ request }) => {
    const res = await request.post("/api/auth/refresh", {
      headers: {
        Cookie: "accbot_refresh_token=forged.invalid.token",
      },
    });

    expect(res.status()).toBe(401);
  });

  test("API upload endpoint rejects unauthenticated file uploads", async ({ request }) => {
    const res = await request.post("/api/upload", {
      data: {
        file: "fake_file_content",
      },
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
