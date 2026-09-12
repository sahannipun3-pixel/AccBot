import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
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

  // Load live notification counts in a single query
  let unreadMessages = 0;
  let pendingExpenses = 0;

  try {
    const [counts] = await sql<{ unread_messages: string; pending_expenses: string }[]>`
      SELECT
        (SELECT COUNT(*)::text FROM contact_messages WHERE is_read = false) as unread_messages,
        (SELECT COUNT(*)::text FROM expenses WHERE status = 'pending') as pending_expenses;
    `;
    unreadMessages = parseInt(counts?.unread_messages ?? "0", 10);
    pendingExpenses = parseInt(counts?.pending_expenses ?? "0", 10);
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
