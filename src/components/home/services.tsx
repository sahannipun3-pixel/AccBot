import type { Service } from "@/types";
import { getActiveServices } from "@/actions/services";
import { ServicesGrid } from "./services-grid";

// ─── Server Component — loads services from DB for home page ───────────────────

export async function Services() {
  let services: Service[] = [];
  try {
    services = await getActiveServices();
  } catch {
    // DB tables not yet created — show empty grid during build/dev
  }
  return <ServicesGrid services={services} />;
}
