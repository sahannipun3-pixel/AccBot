import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import { setAuthCookies, getAccessTokenFromRequest } from "@/lib/auth-cookies";

/**
 * GET /api/auth/token
 *
 * Returns the current access token from the request cookie.
 * Used by client components or external callers that need a bearer token.
 * Refreshes the token if valid.
 *
 * Returns: { accessToken: string } on success
 *          { error: string }       on failure (401)
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = getAccessTokenFromRequest(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(accessToken);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch latest user data
    const [user] = await sql<{ id: string; email: string; role: string; is_active: boolean }[]>`
      SELECT id, email, role, is_active FROM users WHERE id = ${payload.sub} LIMIT 1
    `;

    if (!user || !user.is_active) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [newAccessToken, newRefreshToken] = await Promise.all([
      signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      signRefreshToken({ sub: user.id, email: user.email, role: user.role }),
    ]);

    const response = NextResponse.json({ accessToken: newAccessToken });
    setAuthCookies(response, newAccessToken, newRefreshToken);

    return response;
  } catch (err) {
    console.error("[/api/auth/token] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
