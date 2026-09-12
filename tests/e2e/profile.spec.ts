import { test, expect } from "@playwright/test";
import { testSql } from "../helpers/db";
import { loginViaUI, TEST_USER } from "../helpers/auth";

test.describe("User Profile Management", () => {
  const updatedPhone = "+94 77 555 9999";

  test.afterAll(async () => {
    // Reset phone back in DB
    await testSql`
      UPDATE users SET phone = NULL WHERE email = ${TEST_USER.email.toLowerCase()}
    `;
  });

  test("Profile loads accurate user data and persists edits to the database", async ({ page }) => {
    await loginViaUI(page, TEST_USER);

    await page.goto("/profile");
    await page.waitForLoadState("domcontentloaded");

    // 1. Verify User Information Displays Accurately
    await expect(page.locator("body")).toContainText(TEST_USER.name);
    await expect(page.locator("body")).toContainText(TEST_USER.email);
    await expect(page.locator("body")).toContainText(/User/i);

    // Email field should be disabled / read-only
    const emailInput = page.locator("#portal-email, #email").first();
    const isReadOnly = await emailInput.getAttribute("readonly");
    const isDisabled = await emailInput.getAttribute("disabled");
    expect(isReadOnly !== null || isDisabled !== null).toBe(true);

    // 2. Perform Profile Update
    const phoneInput = page.locator("#portal-phone, #phone").first();
    await phoneInput.fill(updatedPhone);

    const saveBtn = page.locator('form button:has-text("Save")').first();
    await saveBtn.click();

    // Verify feedback toast appears
    await expect(page.locator("body")).toContainText(/Profile updated successfully/i, { timeout: 10000 });

    // 3. Reload the page and verify persistence on UI
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#portal-phone, #phone").first()).toHaveValue(updatedPhone);

    // 4. Verify directly in PostgreSQL database
    const dbRecord = await testSql<{ phone: string }[]>`
      SELECT phone FROM users WHERE email = ${TEST_USER.email.toLowerCase()} LIMIT 1
    `;
    expect(dbRecord.length).toBe(1);
    expect(dbRecord[0].phone).toBe(updatedPhone);
  });
});
