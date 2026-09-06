"use server";

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { logActivity } from "@/actions/activity";
import type { TeamMember } from "@/types";

// ─── Verification Helper ──────────────────────────────────────────────────────
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Unauthorized: Administrator privileges required.");
  }
  return user;
}

// ─── Get Active Team Members (Public) ─────────────────────────────────────────

export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  try {
    const res = await sql<TeamMember[]>`
      SELECT id, name, role, bio, avatar_url, linkedin_url, sort_order, is_active, created_at
      FROM team_members
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `;
    return res;
  } catch (err) {
    console.error("[team] Failed to load team members from database:", err);
    return [];
  }
}

interface GetAllTeamMembersOptions {
  status?: "all" | "active" | "inactive";
  search?: string;
}

export async function getAllTeamMembers(
  options: GetAllTeamMembersOptions = {}
): Promise<TeamMember[]> {
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
        sql`(name ILIKE ${searchPattern} OR role ILIKE ${searchPattern} OR bio ILIKE ${searchPattern})`
      );
    }

    const whereClause =
      conditions.length > 0
        ? sql`WHERE ${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}`
        : sql``;

    const res = await sql<TeamMember[]>`
      SELECT id, name, role, bio, avatar_url, linkedin_url, sort_order, is_active, created_at
      FROM team_members
      ${whereClause}
      ORDER BY sort_order ASC, name ASC
    `;
    return res;
  } catch (err) {
    console.error("[team] Failed to fetch all team members from database:", err);
    return [];
  }
}

// ─── Create Team Member (Admin) ───────────────────────────────────────────────

interface TeamMemberInput {
  name: string;
  role: string;
  bio: string;
  avatar_url?: string | null;
  linkedin_url?: string | null;
  sort_order: number;
  is_active: boolean;
}

export async function createTeamMember(
  data: TeamMemberInput
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const admin = await requireAdmin();

    const [created] = await sql<{ id: string }[]>`
      INSERT INTO team_members (name, role, bio, avatar_url, linkedin_url, sort_order, is_active)
      VALUES (
        ${data.name}, ${data.role}, ${data.bio},
        ${data.avatar_url ?? null}, ${data.linkedin_url ?? null},
        ${data.sort_order}, ${data.is_active}
      )
      RETURNING id
    `;

    await logActivity({
      action: "create_team_member",
      entityType: "team_member",
      entityId: created.id,
      metadata: { name: data.name, role: data.role },
      userId: admin.id,
    });

    return { success: true, id: created.id };
  } catch (err) {
    console.error("[team] createTeamMember error:", err);
    return { success: false, error: (err as Error).message || "Failed to create team member." };
  }
}

// ─── Update Team Member (Admin) ───────────────────────────────────────────────

export async function updateTeamMember(
  id: string,
  data: Partial<TeamMemberInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    await sql`
      UPDATE team_members
      SET
        name         = COALESCE(${data.name ?? null}, name),
        role         = COALESCE(${data.role ?? null}, role),
        bio          = COALESCE(${data.bio ?? null}, bio),
        avatar_url   = COALESCE(${data.avatar_url ?? null}, avatar_url),
        linkedin_url = COALESCE(${data.linkedin_url ?? null}, linkedin_url),
        sort_order   = COALESCE(${data.sort_order ?? null}, sort_order),
        is_active    = COALESCE(${data.is_active ?? null}, is_active)
      WHERE id = ${id}
    `;

    await logActivity({
      action: "update_team_member",
      entityType: "team_member",
      entityId: id,
      metadata: { updated_name: data.name, updated_role: data.role },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[team] updateTeamMember error:", err);
    return { success: false, error: (err as Error).message || "Failed to update team member." };
  }
}

// ─── Toggle Team Member Status (Admin) ────────────────────────────────────────

export async function toggleTeamMemberStatus(
  id: string
): Promise<{ success: boolean; is_active?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const [updated] = await sql<{ id: string; name: string; is_active: boolean }[]>`
      UPDATE team_members
      SET is_active = NOT is_active
      WHERE id = ${id}
      RETURNING id, name, is_active
    `;

    if (!updated) {
      return { success: false, error: "Team member not found." };
    }

    await logActivity({
      action: "toggle_team_member_status",
      entityType: "team_member",
      entityId: id,
      metadata: { name: updated.name, new_status: updated.is_active ? "active" : "inactive" },
      userId: admin.id,
    });

    return { success: true, is_active: updated.is_active };
  } catch (err) {
    console.error("[team] toggleTeamMemberStatus error:", err);
    return { success: false, error: (err as Error).message || "Failed to toggle team member status." };
  }
}

// ─── Delete Team Member (Admin) ───────────────────────────────────────────────

export async function deleteTeamMember(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const [target] = await sql<{ name: string }[]>`SELECT name FROM team_members WHERE id = ${id} LIMIT 1`;

    await sql`DELETE FROM team_members WHERE id = ${id}`;

    await logActivity({
      action: "delete_team_member",
      entityType: "team_member",
      entityId: id,
      metadata: { deleted_name: target?.name ?? id },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[team] deleteTeamMember error:", err);
    return { success: false, error: (err as Error).message || "Failed to delete team member." };
  }
}

export async function getTeamMemberCount(activeOnly = true): Promise<number> {
  try {
    const [result] = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM team_members
      ${activeOnly ? sql`WHERE is_active = true` : sql``}
    `;
    return parseInt(result?.count ?? "0", 10);
  } catch {
    return 0;
  }
}
