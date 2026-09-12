import { test, expect } from "@playwright/test";

test.describe("Broken Link Scanner", () => {
  test("All internal links on public pages resolve to valid routes", async ({ page, request }) => {
    // 1. Visit home page and gather all unique internal links
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const links = await page.$$eval("a", (anchors) =>
      anchors
        .map((a) => a.getAttribute("href"))
        .filter((href): href is string => {
          if (!href) return false;
          // Internal links starting with / but not hash-only or mailto/tel/external
          return href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/#");
        })
    );

    const uniqueLinks = Array.from(new Set(links));
    expect(uniqueLinks.length).toBeGreaterThan(0);

    const brokenLinks: { href: string; status: number }[] = [];

    // 2. Validate each internal URL using HTTP requests
    for (const href of uniqueLinks) {
      // Avoid scanning dynamic auth-protected routes directly in unauthenticated crawl
      if (href.startsWith("/portal") || href.startsWith("/admin") || href.startsWith("/api")) {
        continue;
      }

      try {
        const res = await request.get(href);
        const status = res.status();

        // Must not be 404 or 500
        if (status >= 400) {
          brokenLinks.push({ href, status });
        }
      } catch {
        brokenLinks.push({ href, status: 0 });
      }
    }

    if (brokenLinks.length > 0) {
      console.error("Broken internal links discovered:", brokenLinks);
    }

    expect(brokenLinks).toHaveLength(0);
  });
});
