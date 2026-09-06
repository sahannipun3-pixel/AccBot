"use server";

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { logActivity } from "@/actions/activity";
import type { Testimonial } from "@/types";

// ─── Verification Helper ──────────────────────────────────────────────────────
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Unauthorized: Administrator privileges required.");
  }
  return user;
}

// ─── Get Active Testimonials (Public) ─────────────────────────────────────────

export async function getActiveTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await sql<Testimonial[]>`
      SELECT id, name, company, role, content, avatar_url, rating, is_active, sort_order, created_at
      FROM testimonials
      WHERE is_active = true
      ORDER BY sort_order ASC, created_at DESC
    `;
    return res;
  } catch (err) {
    console.error("[testimonials] Failed to load testimonials from database:", err);
    return [];
  }
}

interface GetAllTestimonialsOptions {
  status?: "all" | "active" | "inactive";
  search?: string;
}

export async function getAllTestimonials(
  options: GetAllTestimonialsOptions = {}
): Promise<Testimonial[]> {
  try {
    const { status = "all", search } = options;
    const conditions = [];

    if (status === "active") {
      conditions.push(sql`is_active = true`);
    } else if (status === "inactive") {
      conditions.push(sql`is_active = false`);
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(
        sql`(name ILIKE ${searchPattern} OR company ILIKE ${searchPattern} OR role ILIKE ${searchPattern} OR content ILIKE ${searchPattern})`
      );
    }

    const whereClause =
      conditions.length > 0
        ? sql`WHERE ${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}`
        : sql``;

    const res = await sql<Testimonial[]>`
      SELECT id, name, company, role, content, avatar_url, rating, is_active, sort_order, created_at
      FROM testimonials
      ${whereClause}
      ORDER BY sort_order ASC, created_at DESC
    `;
    return res;
  } catch (err) {
    console.error("[testimonials] Failed to fetch all testimonials from database:", err);
    return [];
  }
}

// ─── Create Testimonial (Admin) ───────────────────────────────────────────────

interface TestimonialInput {
  name: string;
  company: string;
  role: string;
  content: string;
  avatar_url?: string | null;
  rating: number;
  is_active: boolean;
  sort_order: number;
}

export async function createTestimonial(
  data: TestimonialInput
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const admin = await requireAdmin();

    const [created] = await sql<{ id: string }[]>`
      INSERT INTO testimonials (name, company, role, content, avatar_url, rating, is_active, sort_order)
      VALUES (
        ${data.name}, ${data.company}, ${data.role}, ${data.content},
        ${data.avatar_url ?? null}, ${data.rating}, ${data.is_active}, ${data.sort_order}
      )
      RETURNING id
    `;

    await logActivity({
      action: "create_testimonial",
      entityType: "testimonial",
      entityId: created.id,
      metadata: { client_name: data.name, company: data.company, rating: data.rating },
      userId: admin.id,
    });

    return { success: true, id: created.id };
  } catch (err) {
    console.error("[testimonials] createTestimonial error:", err);
    return { success: false, error: (err as Error).message || "Failed to create testimonial." };
  }
}

// ─── Update Testimonial (Admin) ───────────────────────────────────────────────

export async function updateTestimonial(
  id: string,
  data: Partial<TestimonialInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    await sql`
      UPDATE testimonials
      SET
        name        = COALESCE(${data.name ?? null}, name),
        company     = COALESCE(${data.company ?? null}, company),
        role        = COALESCE(${data.role ?? null}, role),
        content     = COALESCE(${data.content ?? null}, content),
        avatar_url  = COALESCE(${data.avatar_url ?? null}, avatar_url),
        rating      = COALESCE(${data.rating ?? null}, rating),
        is_active   = COALESCE(${data.is_active ?? null}, is_active),
        sort_order  = COALESCE(${data.sort_order ?? null}, sort_order)
      WHERE id = ${id}
    `;

    await logActivity({
      action: "update_testimonial",
      entityType: "testimonial",
      entityId: id,
      metadata: { client_name: data.name, company: data.company },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[testimonials] updateTestimonial error:", err);
    return { success: false, error: (err as Error).message || "Failed to update testimonial." };
  }
}

// ─── Toggle Testimonial Status (Admin) ────────────────────────────────────────

export async function toggleTestimonialStatus(
  id: string
): Promise<{ success: boolean; is_active?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const [updated] = await sql<{ id: string; name: string; is_active: boolean }[]>`
      UPDATE testimonials
      SET is_active = NOT is_active
      WHERE id = ${id}
      RETURNING id, name, is_active
    `;

    if (!updated) {
      return { success: false, error: "Testimonial not found." };
    }

    await logActivity({
      action: "toggle_testimonial_status",
      entityType: "testimonial",
      entityId: id,
      metadata: { client_name: updated.name, new_status: updated.is_active ? "active" : "hidden" },
      userId: admin.id,
    });

    return { success: true, is_active: updated.is_active };
  } catch (err) {
    console.error("[testimonials] toggleTestimonialStatus error:", err);
    return { success: false, error: (err as Error).message || "Failed to update testimonial status." };
  }
}

// ─── Delete Testimonial (Admin) ───────────────────────────────────────────────

export async function deleteTestimonial(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const [target] = await sql<{ name: string }[]>`SELECT name FROM testimonials WHERE id = ${id} LIMIT 1`;

    await sql`DELETE FROM testimonials WHERE id = ${id}`;

    await logActivity({
      action: "delete_testimonial",
      entityType: "testimonial",
      entityId: id,
      metadata: { deleted_name: target?.name ?? id },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[testimonials] deleteTestimonial error:", err);
    return { success: false, error: (err as Error).message || "Failed to delete testimonial." };
  }
}

export async function getTestimonialCount(activeOnly = true): Promise<number> {
  try {
    const [result] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM testimonials
      ${activeOnly ? sql`WHERE is_active = true` : sql``}
    `;
    return parseInt(result?.count ?? "0", 10);
  } catch {
    return 0;
  }
}
