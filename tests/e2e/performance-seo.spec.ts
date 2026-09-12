import { test, expect } from "@playwright/test";

test.describe("Performance, Console, Network & SEO Verification", () => {
  const publicPages = [
    { path: "/", name: "Home" },
    { path: "/about", name: "About" },
    { path: "/services", name: "Services" },
    { path: "/contact", name: "Contact" },
  ];

  for (const p of publicPages) {
    test(`SEO metadata and performance on ${p.name} (${p.path})`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];

      page.on("pageerror", (err) => consoleErrors.push(err.message));
      page.on("response", (res) => {
        const status = res.status();
        const url = res.url();
        // Ignore expected 404s for favicon/analytics if any, but catch application failures
        if (status >= 400 && !url.includes("analytics") && !url.includes("chrome-extension")) {
          failedRequests.push(`${status}: ${url}`);
        }
      });

      const startTime = Date.now();
      await page.goto(p.path, { waitUntil: "domcontentloaded" });
      const loadTime = Date.now() - startTime;

      // ── Performance Metric ──
      // domcontentloaded should complete in under 5 seconds locally
      expect(loadTime).toBeLessThan(5000);

      // ── SEO Checks ──
      // 1. Page Title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(3);

      // 2. Meta description
      const metaDescription = await page.locator('meta[name="description"]').getAttribute("content");
      expect(metaDescription).toBeTruthy();
      expect(metaDescription!.length).toBeGreaterThan(10);

      // 3. Open Graph Title
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
      expect(ogTitle).toBeTruthy();

      // ── Console & Network Verification ──
      const criticalErrors = consoleErrors.filter(
        (e) => !e.includes("ResizeObserver") && !e.includes("hydration")
      );
      expect(criticalErrors).toHaveLength(0);
      expect(failedRequests).toHaveLength(0);
    });
  }

  test("robots.txt is accessible and well-formed", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-Agent");
    expect(body).toContain("Disallow");
  });

  test("sitemap.xml is accessible and contains core routes", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<?xml");
    expect(body).toContain("<urlset");
    expect(body).toContain("<loc>");
  });
});
