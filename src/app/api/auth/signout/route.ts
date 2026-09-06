import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth-cookies";

/**
 * POST /api/auth/signout
 *
 * Clears all JWT auth cookies.
 * The refresh token revocation happens in the signOutUser() server action
 * which should be called before this endpoint in client-side logout flows.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
