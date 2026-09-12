import { test, expect } from "@playwright/test";

test.describe("Public Website Pages", () => {
  const publicRoutes = [
    { path: "/", name: "Home", expectedHeading: /AccBot|Financial|Accounting/i },
    { path: "/about", name: "About", expectedHeading: /About|Who We Are|Our Mission/i },
    { path: "/services", name: "Services", expectedHeading: /Services|Corporate|Advisory/i },
    { path: "/services/accounts-bookkeeping", name: "Service Detail", expectedHeading: /Accounts|Bookkeeping/i },
    { path: "/contact", name: "Contact", expectedHeading: /Contact|Get in Touch|Reach Out|Connect With/i },
    { path: "/privacy", name: "Privacy Policy", expectedHeading: /Privacy Policy/i },
    { path: "/terms", name: "Terms", expectedHeading: /Terms of Service|Terms/i },
  ];

  for (const route of publicRoutes) {
    test(`Page loads successfully: ${route.name} (${route.path})`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(400);

      // Verify main heading exists
      const h1 = page.locator("h1").first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      await expect(h1).toContainText(route.expectedHeading);

      // Verify no unexpected error page text
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toContain("Internal Server Error");
      expect(bodyText).not.toContain("Application error: a client-side exception");

      // Verify images on the page have valid src
      const images = page.locator("img");
      const imgCount = await images.count();
      for (let i = 0; i < Math.min(imgCount, 5); i++) {
        const src = await images.nth(i).getAttribute("src");
        expect(src).toBeTruthy();
      }

      // Assert no critical unhandled JS errors
      const criticalErrors = consoleErrors.filter(
        (e) => !e.includes("ResizeObserver") && !e.includes("hydration")
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }

  test("404 page loads properly for non-existent route", async ({ page }) => {
    const response = await page.goto("/definitely-does-not-exist-xyz-999");
    expect(response?.status()).toBe(404);

    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).toMatch(/404|Page Not Found|not found/i);
  });
});
