import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import PortalLayoutClient from "./_layout-client";

// ─── Portal Layout — Auth Guard ────────────────────────────────────────────────
// Every page under /portal/* is protected. Unauthenticated users are redirected
// to login. Only standard users see this portal; admins are redirected to /admin.

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/portal/dashboard");
  }

  // Admins should use the admin portal, not the client portal
  if (user.role === "admin" || user.role === "super_admin") {
    redirect("/admin");
  }

  return <PortalLayoutClient user={user}>{children}</PortalLayoutClient>;
}
