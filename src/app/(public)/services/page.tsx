import type { Service } from "@/types";
import { getActiveServices } from "@/actions/services";
import ServicesPageClient from "./_client";

// ─── Server Component — fetch live services from DB ────────────────────────────

export default async function ServicesPage() {
  let services: Service[] = [];
  try {
    services = await getActiveServices();
  } catch {
    // DB not yet migrated
  }
  return <ServicesPageClient services={services} />;
}
