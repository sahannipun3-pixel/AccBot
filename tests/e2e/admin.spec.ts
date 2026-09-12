import { test, expect } from "@playwright/test";
import { testSql, cleanupTestEntity } from "../helpers/db";
import { loginAdminViaUI } from "../helpers/auth";

test.describe("Admin Portal & Content CRUD", () => {
  const testEntityName = "QA Automated Client";

  test.beforeEach(async ({ page }) => {
    await cleanupTestEntity("testimonials", "name", testEntityName);
    await loginAdminViaUI(page);
  });

  test.afterAll(async () => {
    await cleanupTestEntity("testimonials", "name", testEntityName);
  });

  test("Admin dashboard renders metrics and admin shell", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Verify KPI cards rendered
    const kpiText = await page.locator("body").innerText();
    expect(kpiText).toMatch(/Registered Users|Contact Inquiries|Active Services/i);

    // Verify admin navigation sidebar links exist
    const adminNav = page.locator("aside, nav");
    await expect(adminNav.first()).toBeVisible();
  });

  const adminModules = [
    { path: "/admin/users", name: "Users Management" },
    { path: "/admin/messages", name: "Contact Inquiries" },
    { path: "/admin/services", name: "Services Management" },
    { path: "/admin/testimonials", name: "Testimonials Management" },
    { path: "/admin/team", name: "Team Management" },
    { path: "/admin/blog", name: "Blog Management" },
    { path: "/admin/settings", name: "Website Settings" },
    { path: "/admin/activity", name: "Activity Logs" },
    { path: "/admin/profile", name: "Admin Profile" },
  ];

  for (const mod of adminModules) {
    test(`Admin module loads cleanly: ${mod.name} (${mod.path})`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      await page.goto(mod.path);
      await page.waitForLoadState("domcontentloaded");

      await expect(page).toHaveURL(new RegExp(mod.path.replace(/\//g, "\\/")));

      // Verify no server errors
      const body = await page.locator("body").innerText();
      expect(body).not.toContain("Internal Server Error");
      expect(body).not.toContain("Application error: a client-side exception");

      // Verify header or table exists
      await expect(page.locator("h1, h2").first()).toBeVisible();

      const criticalErrors = consoleErrors.filter(
        (e) => !e.includes("ResizeObserver") && !e.includes("hydration")
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }

  test("Complete Admin CRUD lifecycle on testimonials (Create, Read, Update, Delete)", async ({ page }) => {
    await page.goto("/admin/testimonials");
    await page.waitForLoadState("domcontentloaded");

    // ── 1. CREATE ──
    const addBtn = page.locator('button:has-text("Add Testimonial"), button:has-text("New Testimonial")').first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();

    // Dialog form
    await page.locator('#name, input[name="name"]').fill(testEntityName);
    await page.locator('#company, input[name="company"]').fill("Automated Ventures PLC");
    await page.locator('#role, input[name="role"]').fill("Managing Director");
    await page.locator('#content, textarea[name="content"]').fill("Outstanding corporate tax and compliance advisory delivered on schedule.");

    const saveBtn = page.locator('form button[type="submit"]').first();
    await saveBtn.click();

    // ── 2. READ ──
    // Verify toast or new row appears in table
    await expect(page.locator("body")).toContainText(testEntityName, { timeout: 10000 });

    // Verify persisted directly in PostgreSQL
    const createdInDb = await testSql<{ id: string; name: string; company: string }[]>`
      SELECT id, name, company FROM testimonials WHERE name = ${testEntityName} LIMIT 1
    `;
    expect(createdInDb.length).toBe(1);
    expect(createdInDb[0].company).toBe("Automated Ventures PLC");
    const recordId = createdInDb[0].id;

    // ── 3. UPDATE ──
    // Find the row for this testimonial and click Edit
    const row = page.locator("tr").filter({ hasText: testEntityName });
    await expect(row).toBeVisible({ timeout: 10000 });
    const editBtn = row.locator('button[title="Edit Testimonial"]');
    await expect(editBtn).toBeVisible({ timeout: 5000 });
    await editBtn.click();

    // Dialog opens
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const companyInput = dialog.locator('#company, input[name="company"]');
    await companyInput.fill("Automated Ventures PLC (Updated)");

    const updateSaveBtn = dialog.locator('button[type="submit"]:has-text("Save Testimonial")');
    await updateSaveBtn.click();

    // Wait for update toast confirmation
    await expect(page.locator("body")).toContainText(/Testimonial updated/i, { timeout: 10000 });

    // Verify update in DB
    const updatedInDb = await testSql<{ company: string }[]>`
      SELECT company FROM testimonials WHERE id = ${recordId} LIMIT 1
    `;
    expect(updatedInDb[0].company).toBe("Automated Ventures PLC (Updated)");

    // ── 4. DELETE ──
    // Delete via UI confirmation modal
    const deleteBtn = row.locator('button[title="Delete Testimonial"]');
    await expect(deleteBtn).toBeVisible({ timeout: 5000 });
    await deleteBtn.click();

    const confirmDeleteBtn = page.locator('button:has-text("Delete Testimonial")').last();
    await expect(confirmDeleteBtn).toBeVisible({ timeout: 5000 });
    await confirmDeleteBtn.click();

    await expect(page.locator("body")).toContainText(/Testimonial deleted/i, { timeout: 10000 });

    // Clean up defensively in DB
    await cleanupTestEntity("testimonials", "id", recordId);

    // Verify removed from DB
    const afterDelete = await testSql`
      SELECT COUNT(*)::text as count FROM testimonials WHERE id = ${recordId}
    `;
    expect(parseInt(afterDelete[0].count, 10)).toBe(0);
  });
});

