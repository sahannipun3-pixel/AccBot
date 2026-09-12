import { test, expect } from "@playwright/test";
import { testSql } from "../helpers/db";

test.describe("PostgreSQL Database Schema & Relational Integrity", () => {
  test("All core tables exist in the public schema", async () => {
    const tables = await testSql<{ table_name: string }[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tableNames = tables.map((t) => t.table_name);

    const requiredTables = [
      "users",
      "services",
      "contact_messages",
      "testimonials",
      "team_members",
      "blog_posts",
      "refresh_tokens",
      "password_reset_tokens",
      "expenses",
      "accounts",
      "website_settings",
    ];

    for (const tbl of requiredTables) {
      expect(tableNames).toContain(tbl);
    }
  });

  test("Foreign key constraints are enforced", async () => {
    // Attempting to insert a refresh token for a non-existent user should fail
    const nonExistentUserId = "00000000-0000-0000-0000-000000000000";
    let failed = false;
    try {
      await testSql`
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
        VALUES (${nonExistentUserId}, 'dummy_hash', NOW() + INTERVAL '1 day')
      `;
    } catch {
      failed = true;
    }
    expect(failed).toBe(true);
  });

  test("Transaction rollback functions properly", async () => {
    const testEmail = "rollback_test@accbot.lk";
    try {
      await testSql.begin(async (tx) => {
        await tx`
          INSERT INTO users (full_name, email, password_hash, role)
          VALUES ('Rollback User', ${testEmail}, 'hash', 'user')
        `;
        // Intentionally throw inside transaction
        throw new Error("Simulated rollback error");
      });
    } catch {
      // Expected rollback
    }

    // Verify user was NOT saved
    const res = await testSql`
      SELECT COUNT(*)::text as count FROM users WHERE email = ${testEmail}
    `;
    expect(parseInt(res[0].count, 10)).toBe(0);
  });

  test("Super admin account is configured with active status", async () => {
    const admin = await testSql<{ email: string; role: string; is_active: boolean }[]>`
      SELECT email, role, is_active FROM users WHERE role = 'super_admin' LIMIT 1
    `;
    expect(admin.length).toBe(1);
    expect(admin[0].is_active).toBe(true);
  });
});
