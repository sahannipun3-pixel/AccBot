"use server";

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { logActivity } from "@/actions/activity";
import { serviceSchema, type ServiceFormData } from "@/lib/validators";
import type { Service } from "@/types";

// ─── Verification Helper ──────────────────────────────────────────────────────
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Unauthorized: Administrator privileges required.");
  }
  return user;
}

// ─── Get Active Services (Public) ─────────────────────────────────────────────

export async function getActiveServices(): Promise<Service[]> {
  try {
    const res = await sql<Service[]>`
      SELECT id, title, slug, icon, short_description, overview,
             benefits, process_steps, faqs, is_active, sort_order, created_at, updated_at
      FROM services
      WHERE is_active = true
      ORDER BY sort_order ASC, title ASC
    `;
    return res;
  } catch (err) {
    console.error("[services] Failed to load active services from database:", err);
    return [];
  }
}

export async function getAllServices(): Promise<Service[]> {
  try {
    const res = await sql<Service[]>`
      SELECT id, title, slug, icon, short_description, overview,
             benefits, process_steps, faqs, is_active, sort_order, created_at, updated_at
      FROM services
      ORDER BY sort_order ASC, title ASC
    `;
    return res;
  } catch (err) {
    console.error("[services] Failed to fetch all services from database:", err);
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const [service] = await sql<Service[]>`
      SELECT id, title, slug, icon, short_description, overview,
             benefits, process_steps, faqs, is_active, sort_order, created_at, updated_at
      FROM services
      WHERE slug = ${slug}
      LIMIT 1
    `;
    return service ?? null;
  } catch (err) {
    console.error(`[services] Failed to fetch service for slug '${slug}':`, err);
    return null;
  }
}

// ─── Create Service (Admin) ───────────────────────────────────────────────────

export async function createService(
  data: ServiceFormData
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const admin = await requireAdmin();

    const result = serviceSchema.safeParse(data);
    if (!result.success) {
      return { success: false, error: "Invalid service data. Please verify all required fields." };
    }

    const {
      title,
      slug,
      icon,
      short_description,
      overview,
      benefits,
      process_steps,
      faqs,
      is_active,
      sort_order,
    } = result.data;

    // Check slug uniqueness
    const [existing] = await sql<{ id: string }[]>`
      SELECT id FROM services WHERE slug = ${slug} LIMIT 1
    `;
    if (existing) {
      return { success: false, error: "A service with this URL slug already exists." };
    }

    const [created] = await sql<{ id: string }[]>`
      INSERT INTO services (
        title, slug, icon, short_description, overview,
        benefits, process_steps, faqs, is_active, sort_order
      )
      VALUES (
        ${title},
        ${slug},
        ${icon},
        ${short_description},
        ${overview},
        ${benefits}::text[],
        ${JSON.stringify(process_steps)}::jsonb,
        ${JSON.stringify(faqs)}::jsonb,
        ${is_active},
        ${sort_order}
      )
      RETURNING id
    `;

    await logActivity({
      action: "create_service",
      entityType: "service",
      entityId: created.id,
      metadata: { title, slug, is_active },
      userId: admin.id,
    });

    return { success: true, id: created.id };
  } catch (err) {
    console.error("[services] createService error:", err);
    return { success: false, error: (err as Error).message || "Failed to create service." };
  }
}

// ─── Update Service (Admin) ───────────────────────────────────────────────────

export async function updateService(
  id: string,
  data: Partial<ServiceFormData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    // If slug is changing, verify uniqueness
    if (data.slug) {
      const [existing] = await sql<{ id: string }[]>`
        SELECT id FROM services WHERE slug = ${data.slug} AND id != ${id} LIMIT 1
      `;
      if (existing) {
        return { success: false, error: "Another service is already using this URL slug." };
      }
    }

    await sql`
      UPDATE services
      SET
        title             = COALESCE(${data.title ?? null}, title),
        slug              = COALESCE(${data.slug ?? null}, slug),
        icon              = COALESCE(${data.icon ?? null}, icon),
        short_description = COALESCE(${data.short_description ?? null}, short_description),
        overview          = COALESCE(${data.overview ?? null}, overview),
        benefits          = ${data.benefits !== undefined ? data.benefits : sql`benefits`},
        process_steps     = ${data.process_steps !== undefined ? JSON.stringify(data.process_steps) : sql`process_steps`}::jsonb,
        faqs              = ${data.faqs !== undefined ? JSON.stringify(data.faqs) : sql`faqs`}::jsonb,
        is_active         = COALESCE(${data.is_active ?? null}, is_active),
        sort_order        = COALESCE(${data.sort_order ?? null}, sort_order),
        updated_at        = NOW()
      WHERE id = ${id}
    `;

    await logActivity({
      action: "update_service",
      entityType: "service",
      entityId: id,
      metadata: { updated_title: data.title, updated_slug: data.slug },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[services] updateService error:", err);
    return { success: false, error: (err as Error).message || "Failed to update service." };
  }
}

// ─── Toggle Service Visibility (Admin) ────────────────────────────────────────

export async function toggleServiceVisibility(
  id: string
): Promise<{ success: boolean; is_active?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const [updated] = await sql<{ id: string; title: string; is_active: boolean }[]>`
      UPDATE services
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, title, is_active
    `;

    if (!updated) {
      return { success: false, error: "Service not found." };
    }

    await logActivity({
      action: "toggle_service_visibility",
      entityType: "service",
      entityId: id,
      metadata: { service_title: updated.title, new_status: updated.is_active ? "published" : "hidden" },
      userId: admin.id,
    });

    return { success: true, is_active: updated.is_active };
  } catch (err) {
    console.error("[services] toggleServiceVisibility error:", err);
    return { success: false, error: (err as Error).message || "Failed to toggle service visibility." };
  }
}

// ─── Delete Service (Admin) ───────────────────────────────────────────────────

export async function deleteService(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const [target] = await sql<{ title: string }[]>`SELECT title FROM services WHERE id = ${id} LIMIT 1`;

    await sql`DELETE FROM services WHERE id = ${id}`;

    await logActivity({
      action: "delete_service",
      entityType: "service",
      entityId: id,
      metadata: { deleted_title: target?.title ?? id },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[services] deleteService error:", err);
    return { success: false, error: (err as Error).message || "Failed to delete service." };
  }
}

// ─── Get Service Count ────────────────────────────────────────────────────────

export async function getServiceCount(activeOnly = true): Promise<number> {
  try {
    const [result] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM services
      ${activeOnly ? sql`WHERE is_active = true` : sql``}
    `;
    return parseInt(result?.count ?? "0", 10);
  } catch {
    return 0;
  }
}
