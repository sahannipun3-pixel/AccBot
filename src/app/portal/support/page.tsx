import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import SupportClient from "./_client";

export const metadata = {
  title: "Help & Support | AccBot Client Portal",
};

export default async function SupportPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/portal/support");
  }

  return <SupportClient user={user} />;
}
