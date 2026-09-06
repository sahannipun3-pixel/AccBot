import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import SecurityClient from "./_client";

export const metadata = {
  title: "Security | AccBot Client Portal",
};

export default async function SecurityPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/portal/security");
  }

  return <SecurityClient user={user} />;
}
