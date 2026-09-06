import { getSettingsMap } from "@/actions/settings";
import AdminSettingsClient from "./_client";

// ─── Server Component — Fetch Real Settings ────────────────────────────────────

export default async function AdminSettingsPage() {
  const settingsMap = await getSettingsMap();
  return <AdminSettingsClient initialSettings={settingsMap} />;
}
