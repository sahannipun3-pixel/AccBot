"use server";

import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import { logActivity } from "@/actions/activity";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validators";
import type { User, UserRole } from "@/types";

// ─── Verification Helper ──────────────────────────────────────────────────────
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Unauthorized: Administrator privileges required.");
  }
  return user;
}

// ─── Get User by ID ────────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<User | null> {
  try {
    const [user] = await sql<User[]>`
      SELECT id, full_name, email, phone, avatar_url, role, is_active, created_at, updated_at
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `;
    return user ?? null;
  } catch (err) {
    console.error(`[users] Failed to fetch user '${id}' from database:`, err);
    return null;
  }
}

interface GetAllUsersOptions {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export async function getAllUsers(
  options: GetAllUsersOptions = {}
): Promise<{ users: User[]; total: number }> {
  try {
    await requireAdmin();
    const { page = 1, limit = 50, role, status, search } = options;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (role && role !== "all") {
      conditions.push(sql`role = ${role}`);
    }

    if (status === "active") {
      conditions.push(sql`is_active = true`);
    } else if (status === "inactive") {
      conditions.push(sql`is_active = false`);
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(
        sql`(full_name ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR COALESCE(phone, '') ILIKE ${searchPattern})`
      );
    }

    const whereClause =
      conditions.length > 0
        ? sql`WHERE ${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}`
        : sql``;

    const [users, countResult] = await Promise.all([
      sql<User[]>`
        SELECT id, full_name, email, phone, avatar_url, role, is_active, created_at, updated_at
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM users
        ${whereClause}
      `,
    ]);

    return {
      users,
      total: parseInt(countResult[0]?.count ?? "0", 10),
    };
  } catch (err) {
    console.error("[users] Failed to fetch users from database:", err);
    return { users: [], total: 0 };
  }
}

// ─── Update Profile ────────────────────────────────────────────────────────────

interface UpdateProfileData {
  full_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileData
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthenticated." };
    }

    // Allow user to edit own profile, or admins to edit
    if (currentUser.id !== userId && currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      return { success: false, error: "Unauthorized." };
    }

    await sql`
      UPDATE users
      SET
        full_name  = COALESCE(${data.full_name ?? null}, full_name),
        phone      = ${data.phone !== undefined ? (data.phone || null) : sql`phone`},
        avatar_url = ${data.avatar_url !== undefined ? (data.avatar_url || null) : sql`avatar_url`},
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    await logActivity({
      action: "update_profile",
      entityType: "user",
      entityId: userId,
      metadata: { updated_fields: Object.keys(data) },
      userId: currentUser.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[users] updateProfile error:", err);
    return { success: false, error: "Failed to update profile." };
  }
}

// ─── Change Password (for logged-in user / admin) ──────────────────────────────

export async function changePassword(
  data: ChangePasswordFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthenticated." };
    }

    const parseResult = changePasswordSchema.safeParse(data);
    if (!parseResult.success) {
      return { success: false, error: "Please verify password requirements." };
    }

    const { currentPassword, newPassword } = parseResult.data;

    // Get current password hash
    const [userRecord] = await sql<{ password_hash: string }[]>`
      SELECT password_hash FROM users WHERE id = ${currentUser.id} LIMIT 1
    `;

    if (!userRecord) {
      return { success: false, error: "User record not found." };
    }

    const isMatch = await bcrypt.compare(currentPassword, userRecord.password_hash);
    if (!isMatch) {
      return { success: false, error: "Current password is incorrect." };
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await sql`
      UPDATE users
      SET password_hash = ${newHash}, updated_at = NOW()
      WHERE id = ${currentUser.id}
    `;

    await logActivity({
      action: "change_password",
      entityType: "user",
      entityId: currentUser.id,
      userId: currentUser.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[users] changePassword error:", err);
    return { success: false, error: "Failed to change password." };
  }
}

// ─── Update User Role (Admin) ─────────────────────────────────────────────────

export async function updateUserRole(
  userId: string,
  role: "super_admin" | "admin" | "user"
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    // Prevent changing own role or downgrading super_admin if not super_admin
    const [targetUser] = await sql<User[]>`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
    if (!targetUser) {
      return { success: false, error: "Target user not found." };
    }

    if (admin.role !== "super_admin" && (targetUser.role === "super_admin" || role === "super_admin")) {
      return { success: false, error: "Only super administrators can manage super_admin privileges." };
    }

    if (admin.id === userId && role !== admin.role) {
      return { success: false, error: "You cannot change your own role." };
    }

    await sql`
      UPDATE users SET role = ${role}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    await logActivity({
      action: "update_role",
      entityType: "user",
      entityId: userId,
      metadata: { previous_role: targetUser.role, new_role: role, target_email: targetUser.email },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[users] updateUserRole error:", err);
    return { success: false, error: (err as Error).message || "Failed to update user role." };
  }
}

// ─── Toggle User Status (Admin) ───────────────────────────────────────────────

export async function toggleUserStatus(
  userId: string
): Promise<{ success: boolean; error?: string; is_active?: boolean }> {
  try {
    const admin = await requireAdmin();

    const [targetUser] = await sql<User[]>`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
    if (!targetUser) {
      return { success: false, error: "Target user not found." };
    }

    if (admin.id === userId) {
      return { success: false, error: "You cannot deactivate your own account." };
    }

    if (targetUser.role === "super_admin" && admin.role !== "super_admin") {
      return { success: false, error: "Only super administrators can modify super_admin status." };
    }

    const [updated] = await sql<{ is_active: boolean }[]>`
      UPDATE users
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING is_active
    `;

    await logActivity({
      action: "toggle_status",
      entityType: "user",
      entityId: userId,
      metadata: { target_email: targetUser.email, new_status: updated?.is_active ? "active" : "inactive" },
      userId: admin.id,
    });

    return { success: true, is_active: updated?.is_active };
  } catch (err) {
    console.error("[users] toggleUserStatus error:", err);
    return { success: false, error: (err as Error).message || "Failed to toggle user status." };
  }
}

// ─── Delete User (Admin) ──────────────────────────────────────────────────────

export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const [targetUser] = await sql<User[]>`SELECT * FROM users WHERE id = ${userId} LIMIT 1`;
    if (!targetUser) {
      return { success: false, error: "Target user not found." };
    }

    if (admin.id === userId) {
      return { success: false, error: "You cannot delete your own account." };
    }

    if (targetUser.role === "super_admin" && admin.role !== "super_admin") {
      return { success: false, error: "Only super administrators can delete super_admin accounts." };
    }

    await sql`DELETE FROM users WHERE id = ${userId}`;

    await logActivity({
      action: "delete_user",
      entityType: "user",
      entityId: userId,
      metadata: { deleted_email: targetUser.email, deleted_name: targetUser.full_name },
      userId: admin.id,
    });

    return { success: true };
  } catch (err) {
    console.error("[users] deleteUser error:", err);
    return { success: false, error: (err as Error).message || "Failed to delete user." };
  }
}

// ─── Get User Count ───────────────────────────────────────────────────────────

export async function getUserCount(): Promise<number> {
  try {
    const [result] = await sql<{ count: string }[]>`SELECT COUNT(*)::text as count FROM users`;
    return parseInt(result?.count ?? "0", 10);
  } catch {
    return 0;
  }
}
