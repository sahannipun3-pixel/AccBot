import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getActiveServices } from "@/actions/services";
import ServicesClient from "./_client";

export const metadata = {
  title: "Our Services | AccBot Client Portal",
};

export default async function PortalServicesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/portal/services");
  }

  const services = await getActiveServices();

  return <ServicesClient services={services} />;
}
