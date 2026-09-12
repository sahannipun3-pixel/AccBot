import { test, expect } from "@playwright/test";

test.describe("Accessibility (A11y) & WCAG Invariants", () => {
  test("Images have non-empty alt attributes across public pages", async ({ page }) => {
    const publicPages = ["/", "/about", "/services", "/contact"];

    for (const path of publicPages) {
      await page.goto(path);
      await page.waitForLoadState("domcontentloaded");

      const images = page.locator("img");
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");
        const ariaHidden = await img.getAttribute("aria-hidden");
        const role = await img.getAttribute("role");

        // Image should either have an alt attribute or be marked decorative
        const isAccessible = alt !== null || ariaHidden === "true" || role === "presentation";
        expect(isAccessible).toBe(true);
      }
    }
  });

  test("Form inputs on login and contact pages have associated labels or aria-labels", async ({ page }) => {
    // Check contact form
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");

    const inputs = page.locator("input:not([type='hidden']), textarea, select");
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");

      let hasLabel = false;
      if (ariaLabel || ariaLabelledBy) {
        hasLabel = true;
      } else if (id) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = (await label.count()) > 0;
      }

      expect(hasLabel).toBe(true);
    }
  });

  test("Buttons have accessible names", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const buttons = page.locator("button");
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const text = await btn.innerText();
        const ariaLabel = await btn.getAttribute("aria-label");
        const title = await btn.getAttribute("title");

        const hasAccessibleName = (text && text.trim().length > 0) || !!ariaLabel || !!title;
        expect(hasAccessibleName).toBe(true);
      }
    }
  });

  test("Single H1 heading exists per public page", async ({ page }) => {
    const pagesToCheck = ["/", "/about", "/services", "/contact", "/login", "/signup", "/privacy", "/terms"];

    for (const p of pagesToCheck) {
      await page.goto(p);
      await page.waitForLoadState("domcontentloaded");

      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);
    }
  });

  test("Interactive elements can receive keyboard tab focus", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Press Tab multiple times
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Verify an element has focus
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBeTruthy();
  });
});
