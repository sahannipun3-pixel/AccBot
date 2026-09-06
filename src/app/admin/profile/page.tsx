import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import AdminProfileClient from "./_client";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/admin/profile");
  }

  return <AdminProfileClient user={user} />;
}
