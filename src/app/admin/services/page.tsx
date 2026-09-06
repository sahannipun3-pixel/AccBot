import { getAllServices } from "@/actions/services";
import AdminServicesClient from "./_client";

// ─── Server Component — Fetch Real Services ────────────────────────────────────

export default async function AdminServicesPage() {
  const services = await getAllServices();
  return <AdminServicesClient initialServices={services} />;
}
