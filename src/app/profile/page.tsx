import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

// ─── Backward Compatibility Redirect ──────────────────────────────────────────
// Redirect to role-appropriate profile (/admin/profile or /portal/profile)

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  if (user.role === "admin" || user.role === "super_admin") {
    redirect("/admin/profile");
  }

  redirect("/portal/profile");
}
