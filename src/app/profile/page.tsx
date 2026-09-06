import { redirect } from "next/navigation";

// ─── Backward Compatibility Redirect ──────────────────────────────────────────
// The old /profile URL now redirects to the new authenticated client portal.

export default function ProfilePage() {
  redirect("/portal/profile");
}
