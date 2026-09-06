"use server";

import { sql } from "@/lib/db";
import { getCurrentUser } from "@/actions/auth";
import type { ActivityLog } from "@/types";

export interface LogActivityParams {
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  userId?: string | null;
}

/**
 * Records an activity event in public.activity_logs.
 * Can be called with an explicit userId or will automatically use the logged-in user.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    let resolvedUserId = params.userId;
    if (!resolvedUserId) {
      const currentUser = await getCurrentUser();
      resolvedUserId = currentUser?.id ?? null;
    }

    const metadataJson = JSON.stringify(params.metadata ?? {});

    await sql`
      INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
      VALUES (
        ${resolvedUserId},
        ${params.action},
        ${params.entityType},
        ${params.entityId ?? null},
        ${metadataJson}::jsonb
      )
    `;
  } catch (err) {
    // Non-blocking: log warning to server console, do not fail primary user action
    console.warn("[activity_logs] Failed to log activity:", (err as Error).message);
  }
}

interface GetActivityLogsOptions {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
  search?: string;
}

export async function getActivityLogs(
  options: GetActivityLogsOptions = {}
): Promise<{ logs: ActivityLog[]; total: number }> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return { logs: [], total: 0 };
    }

    const { page = 1, limit = 20, entityType, action, search } = options;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (entityType && entityType !== "all") {
      conditions.push(sql`a.entity_type = ${entityType}`);
    }

    if (action && action !== "all") {
      conditions.push(sql`a.action = ${action}`);
    }

    if (search && search.trim() !== "") {
      const searchPattern = `%${search.trim()}%`;
      conditions.push(
        sql`(a.action ILIKE ${searchPattern} OR a.entity_type ILIKE ${searchPattern} OR COALESCE(u.full_name, '') ILIKE ${searchPattern} OR COALESCE(u.email, '') ILIKE ${searchPattern})`
      );
    }

    const whereClause =
      conditions.length > 0
        ? sql`WHERE ${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)}`
        : sql``;

    const [logs, countResult] = await Promise.all([
      sql<
        (ActivityLog & {
          user_name: string | null;
          user_email: string | null;
        })[]
      >`
        SELECT 
          a.id, 
          a.user_id, 
          a.action, 
          a.entity_type, 
          a.entity_id, 
          a.metadata, 
          a.ip_address, 
          a.created_at,
          u.full_name as user_name,
          u.email as user_email
        FROM activity_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      sql<{ count: string }[]>`
        SELECT COUNT(*)::text as count
        FROM activity_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ${whereClause}
      `,
    ]);

    return {
      logs,
      total: parseInt(countResult[0]?.count ?? "0", 10),
    };
  } catch (err) {
    console.error("[activity_logs] getActivityLogs error:", err);
    return { logs: [], total: 0 };
  }
}

export async function getRecentActivity(limit = 6): Promise<ActivityLog[]> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return [];
    }

    return await sql<
      (ActivityLog & {
        user_name: string | null;
        user_email: string | null;
      })[]
    >`
      SELECT 
        a.id, 
        a.user_id, 
        a.action, 
        a.entity_type, 
        a.entity_id, 
        a.metadata, 
        a.ip_address, 
        a.created_at,
        u.full_name as user_name,
        u.email as user_email
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ${limit}
    `;
  } catch (err) {
    console.error("[activity_logs] getRecentActivity error:", err);
    return [];
  }
}
