import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import PortalProfileClient from "./_client";

export const metadata = {
  title: "My Profile | AccBot Client Portal",
};

export default async function PortalProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/portal/profile");
  }

  return <PortalProfileClient user={user} />;
}
