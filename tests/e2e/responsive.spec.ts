import { test, expect } from "@playwright/test";

test.describe("Responsive Layouts & Viewport Adaptability", () => {
  const viewports = [
    { name: "Desktop (1920x1080)", width: 1920, height: 1080 },
    { name: "Laptop (1366x768)", width: 1366, height: 768 },
    { name: "Tablet (768x1024)", width: 768, height: 1024 },
    { name: "Mobile (390x844)", width: 390, height: 844 },
  ];

  const testedPages = ["/", "/services", "/contact", "/login", "/signup"];

  for (const vp of viewports) {
    test.describe(vp.name, () => {
      for (const path of testedPages) {
        test(`Page has no horizontal scrollbar overflow: ${path}`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(path);
          await page.waitForLoadState("domcontentloaded");

          // Check if document has unintended horizontal overflow
          const hasHorizontalOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
          });

          expect(hasHorizontalOverflow).toBe(false);

          // Ensure page content rendered
          if (path === "/login" || path === "/signup") {
            await expect(page.locator("form, main, [role='main']").first()).toBeVisible();
          } else {
            await expect(page.locator("header")).toBeVisible();
          }
        });
      }

      if (vp.width < 768) {
        test("Mobile menu toggle button is visible and operable", async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto("/");
          await page.waitForLoadState("domcontentloaded");

          const hamburgerBtn = page.locator('header button[aria-label="Toggle mobile menu"]');
          await expect(hamburgerBtn).toBeVisible();
        });
      }
    });
  }
});
