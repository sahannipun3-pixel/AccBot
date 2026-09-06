import { getMessages } from "@/actions/messages";
import AdminMessagesClient from "./_client";

// ─── Server Component — Fetch Real Messages ────────────────────────────────────

export default async function AdminMessagesPage() {
  const { messages, total } = await getMessages({ page: 1, limit: 100 });
  return <AdminMessagesClient initialMessages={messages} total={total} />;
}
