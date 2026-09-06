import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import {
  setAuthCookies,
  clearAuthCookies,
  getRefreshTokenFromRequest,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth-cookies";

/**
 * POST /api/auth/refresh
 *
 * Custom JWT token rotation endpoint.
 * Validates the refresh token cookie against the database,
 * then mints a new JWT pair (access + refresh), rotating the old one.
 *
 * No Supabase Auth dependencies.
 */
export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshTokenFromRequest(request);

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token provided." }, { status: 401 });
    }

    // Verify the JWT signature
    const payload = await verifyToken(refreshToken);
    if (!payload || (payload as Record<string, unknown>).type !== "refresh") {
      const response = NextResponse.json(
        { error: "Invalid or expired refresh token." },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    // Check the token hasn't been revoked in the DB
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const [record] = await sql<{ user_id: string }[]>`
      SELECT user_id FROM refresh_tokens
      WHERE token_hash = ${tokenHash}
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `;

    if (!record) {
      const response = NextResponse.json(
        { error: "Refresh token has been revoked or expired." },
        { status: 401 }
      );
      clearAuthCookies(response);
      return response;
    }

    // Fetch the latest user data
    const [user] = await sql<{ id: string; email: string; role: string; is_active: boolean }[]>`
      SELECT id, email, role, is_active
      FROM users
      WHERE id = ${record.user_id}
      LIMIT 1
    `;

    if (!user || !user.is_active) {
      const response = NextResponse.json({ error: "User not found or inactive." }, { status: 401 });
      clearAuthCookies(response);
      return response;
    }

    // Determine if rememberMe was active (original token expiry > 7 days)
    const nowSec = Math.floor(Date.now() / 1000);
    const originalExpDuration = payload.exp ? payload.exp - (payload.iat ?? nowSec) : 0;
    const rememberMe = originalExpDuration > 7 * 24 * 60 * 60;

    // Revoke old refresh token
    await sql`
      UPDATE refresh_tokens SET revoked_at = NOW()
      WHERE token_hash = ${tokenHash}
    `;

    // Mint new token pair
    const [newAccessToken, newRefreshToken] = await Promise.all([
      signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      signRefreshToken({ sub: user.id, email: user.email, role: user.role, rememberMe }),
    ]);

    // Store new refresh token
    const newTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    const expiresAt = new Date(
      Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000
    ).toISOString();
    await sql`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${newTokenHash}, ${expiresAt})
      ON CONFLICT (token_hash) DO NOTHING
    `;

    // Return new tokens via cookies
    const response = NextResponse.json({ success: true });
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    setAuthCookies(response, newAccessToken, newRefreshToken, rememberMe);

    return response;
  } catch (err) {
    console.error("[/api/auth/refresh] Error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
