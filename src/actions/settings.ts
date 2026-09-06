"use server";

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { logActivity } from "@/actions/activity";
import type { WebsiteSetting } from "@/types";

// ─── Verification Helper ──────────────────────────────────────────────────────
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Unauthorized: Administrator privileges required.");
  }
  return user;
}

// ─── Get All Settings ──────────────────────────────────────────────────────────

export async function getSettings(): Promise<WebsiteSetting[]> {
  try {
    const res = await sql<WebsiteSetting[]>`
      SELECT id, key, value, category, updated_at
      FROM website_settings
      ORDER BY category ASC, key ASC
    `;
    return res;
  } catch (err) {
    console.error("[settings] Failed to load website settings from database:", err);
    return [];
  }
}

export async function getSettingsByCategory(
  category: "general" | "contact" | "seo" | "social"
): Promise<WebsiteSetting[]> {
  try {
    const res = await sql<WebsiteSetting[]>`
      SELECT id, key, value, category, updated_at
      FROM website_settings
      WHERE category = ${category}
      ORDER BY key ASC
    `;
    return res;
  } catch (err) {
    console.error(`[settings] Failed to fetch settings for category '${category}':`, err);
    return [];
  }
}

export async function getSettingsMap(): Promise<Record<string, string>> {
  try {
    const rows = await sql<{ key: string; value: string }[]>`
      SELECT key, value FROM website_settings
    `;
    if (rows.length > 0) {
      return Object.fromEntries(rows.map((r) => [r.key, r.value]));
    }
    return {};
  } catch (err) {
    console.error("[settings] Failed to fetch settings map from database:", err);
    return {};
  }
}

// ─── Upsert Single Setting (Admin) ────────────────────────────────────────────

export async function upsertSetting(
  key: string,
  value: string,
  category: "general" | "contact" | "seo" | "social"
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    await sql`
      INSERT INTO website_settings (key, value, category)
      VALUES (${key}, ${value}, ${category})
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
    `;

    await logActivity({
      action: "update_website_setting",
      entityType: "website_setting",
      entityId: key,
      metadata: { key, category },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[settings] upsertSetting error:", err);
    return { success: false, error: (err as Error).message || "Failed to save setting." };
  }
}

// ─── Upsert Batch Settings (Admin) ────────────────────────────────────────────

interface SettingInput {
  key: string;
  value: string;
  category: "general" | "contact" | "seo" | "social";
}

export async function upsertSettingsBatch(
  settings: SettingInput[]
): Promise<{ success: boolean; error?: string }> {
  if (!settings.length) return { success: true };

  try {
    const admin = await requireAdmin();

    await sql.begin(async (tx) => {
      for (const { key, value, category } of settings) {
        await tx`
          INSERT INTO website_settings (key, value, category)
          VALUES (${key}, ${value}, ${category})
          ON CONFLICT (key) DO UPDATE
          SET value = EXCLUDED.value, updated_at = NOW()
        `;
      }
    });

    await logActivity({
      action: "update_website_settings_batch",
      entityType: "website_setting",
      metadata: { updated_keys: settings.map((s) => s.key) },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[settings] upsertSettingsBatch error:", err);
    return { success: false, error: (err as Error).message || "Failed to save settings." };
  }
}
