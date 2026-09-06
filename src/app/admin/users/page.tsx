import { getAllUsers } from "@/actions/users";
import AdminUsersClient from "./_client";

// ─── Server Component — Fetch Real Users ──────────────────────────────────────

export default async function AdminUsersPage() {
  const { users, total } = await getAllUsers();
  return <AdminUsersClient initialUsers={users} total={total} />;
}
