import { getActivityLogs } from "@/actions/activity";
import AdminActivityClient from "./_client";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const { logs, total } = await getActivityLogs({ page: 1, limit: 50 });
  return <AdminActivityClient initialLogs={logs} total={total} />;
}
