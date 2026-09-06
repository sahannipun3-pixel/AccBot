import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { sql } from "@/lib/db";
import { getActiveServices } from "@/actions/services";
import DashboardClient from "./_client";
import type { ActivityLog } from "@/types";

export const metadata = {
  title: "Dashboard | AccBot Client Portal",
};

// ─── Server Component — Load Real Data ────────────────────────────────────────

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/portal/dashboard");
  }

  // Load user's own activity logs (last 6)
  let recentActivity: ActivityLog[] = [];
  let servicesCount = 0;

  try {
    const [activityRows, services] = await Promise.all([
      sql<ActivityLog[]>`
        SELECT id, user_id, action, entity_type, entity_id, metadata, ip_address, created_at
        FROM activity_logs
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 6
      `,
      getActiveServices(),
    ]);
    recentActivity = activityRows;
    servicesCount = services.length;
  } catch (err) {
    console.error("[portal/dashboard] Failed to load dashboard data:", err);
  }

  return (
    <DashboardClient
      user={user}
      recentActivity={recentActivity}
      servicesCount={servicesCount}
    />
  );
}
