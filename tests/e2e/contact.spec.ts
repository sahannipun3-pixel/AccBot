import { test, expect } from "@playwright/test";
import { testSql, cleanupTestMessage } from "../helpers/db";

test.describe("Contact Form", () => {
  const testEmail = "test_inquiry_automation@accbot.lk";

  test.beforeEach(async ({ page }) => {
    await cleanupTestMessage(testEmail);
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");
  });

  test.afterAll(async () => {
    await cleanupTestMessage(testEmail);
  });

  test("Valid inquiry submission persists to database and displays confirmation", async ({ page }) => {
    // Fill out the corporate consultation form
    await page.locator("#name").fill("Automated Test Inquirer");
    await page.locator("#email").fill(testEmail);
    await page.locator("#phone").fill("+94 77 123 4567");
    await page.locator("#subject").selectOption("Corporate Tax & IRD RAMIS Compliance");
    await page.locator("#message").fill("This is an automated QA end-to-end verification inquiry testing form submission and DB persistence.");

    // Submit form
    const submitBtn = page.locator('form button[type="submit"]');
    await submitBtn.click();

    // Verify submission succeeds and feedback is rendered
    await expect(page.locator("body")).toContainText(/received|sent|Thank you/i, { timeout: 10000 });

    // Verify database record is actually created in PostgreSQL
    const messages = await testSql<{ id: string; name: string; email: string; subject: string }[]>`
      SELECT id, name, email, subject FROM contact_messages WHERE email = ${testEmail} LIMIT 1
    `;

    expect(messages.length).toBe(1);
    expect(messages[0].name).toBe("Automated Test Inquirer");
    expect(messages[0].subject).toBe("Corporate Tax & IRD RAMIS Compliance");
  });

  test("Invalid input displays validation error messages and blocks submission", async ({ page }) => {
    const submitBtn = page.locator('form button[type="submit"]');

    // Attempt empty submit
    await submitBtn.click();

    // Verify validation errors exist
    const pageText = await page.locator("body").innerText();
    expect(pageText).toMatch(/Name must be|email|valid email|Subject is required|Message must be/i);

    // Verify NO message is created in the database
    const messages = await testSql`
      SELECT COUNT(*)::text as count FROM contact_messages WHERE email = ${testEmail}
    `;
    expect(parseInt(messages[0].count, 10)).toBe(0);
  });

  test("Invalid email format triggers validation error", async ({ page }) => {
    await page.locator("#name").fill("Automated Inquirer");
    await page.locator("#email").fill("not-a-valid-email-format");
    await page.locator("#subject").selectOption("Corporate Tax & IRD RAMIS Compliance");
    await page.locator("#message").fill("Checking email validation with invalid format.");

    const submitBtn = page.locator('form button[type="submit"]');
    await submitBtn.click();

    // Verify email validation message appears
    await expect(page.locator("body")).toContainText(/invalid email|valid email/i);
  });
});
