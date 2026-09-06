import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getMessageCount } from "@/actions/messages";
import { sql } from "@/lib/db";
import AdminLayoutClient from "./_layout-client";

// ─── Server Component — Role Guard & Context Loader ───────────────────────────

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    redirect("/portal/dashboard");
  }

  // Load live notification counts
  let unreadMessages = 0;
  let pendingExpenses = 0;

  try {
    const [msgCount, expCount] = await Promise.all([
      getMessageCount(true),
      sql<{ count: string }[]>`SELECT COUNT(*)::text as count FROM expenses WHERE status = 'pending'`,
    ]);
    unreadMessages = msgCount;
    pendingExpenses = parseInt(expCount[0]?.count ?? "0", 10);
  } catch (err) {
    console.error("[admin/layout] Failed to load notification counts:", err);
  }

  return (
    <AdminLayoutClient
      user={user}
      unreadMessages={unreadMessages}
      pendingExpenses={pendingExpenses}
    >
      {children}
    </AdminLayoutClient>
  );
}
