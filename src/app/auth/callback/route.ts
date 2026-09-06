import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { sql } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookies";

/**
 * GET /auth/callback
 *
 * Exclusively handles the Google OAuth 2.0 authorization code callback.
 * Custom JWT and PostgreSQL session generation (no Supabase Auth).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (error || !code) {
    console.error("Google OAuth error or missing code:", error);
    return NextResponse.redirect(`${siteUrl}/login?error=${encodeURIComponent(error || "Google authorization failed.")}`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || "insert-google-client-id-here";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "insert-google-client-secret-here";
    const redirectUri = `${siteUrl}/auth/callback`;

    // 1. Exchange OAuth code for Google tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("Google token exchange error response:", errText);
      return NextResponse.redirect(`${siteUrl}/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    if (!access_token) {
      console.error("No access token returned from Google token endpoint");
      return NextResponse.redirect(`${siteUrl}/login?error=access_token_missing`);
    }

    // 2. Fetch user profile information using the access token
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userInfoResponse.ok) {
      const errText = await userInfoResponse.text();
      console.error("Google user info error response:", errText);
      return NextResponse.redirect(`${siteUrl}/login?error=user_info_failed`);
    }

    const googleUser = await userInfoResponse.json();
    const { email, name, picture } = googleUser;

    if (!email) {
      console.error("No email associated with Google user account");
      return NextResponse.redirect(`${siteUrl}/login?error=email_missing`);
    }

    // 3. Check if user exists in the database
    let [user] = await sql<{ id: string; email: string; role: string; is_active: boolean }[]>`
      SELECT id, email, role, is_active FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
    `;

    if (!user) {
      // 4. Register new user automatically under user role
      // Create a random placeholder hash since they authenticate via Google
      const randomPasswordHash = crypto.randomBytes(32).toString("hex");

      const [newUser] = await sql<{ id: string; email: string; role: string; is_active: boolean }[]>`
        INSERT INTO users (full_name, email, password_hash, avatar_url, role, is_active)
        VALUES (${name || "Google User"}, ${email.toLowerCase()}, ${randomPasswordHash}, ${picture || null}, 'user', true)
        RETURNING id, email, role, is_active
      `;
      user = newUser;
    }

    if (!user.is_active) {
      return NextResponse.redirect(`${siteUrl}/login?error=account_deactivated`);
    }

    // 5. Mint custom App JWT Tokens (Stateless Session)
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({ sub: user.id, email: user.email, role: user.role }),
      signRefreshToken({ sub: user.id, email: user.email, role: user.role }),
    ]);

    // 6. Write HttpOnly Cookies
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 mins
    });

    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // 7. Store hashed refresh token in database for rotation/audit logs
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await sql`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${tokenHash}, ${expiresAt})
      ON CONFLICT (token_hash) DO NOTHING
    `;

    // 8. Redirect authenticated user to profile settings page
    return NextResponse.redirect(`${siteUrl}/profile`);
  } catch (err) {
    console.error("Google OAuth Callback Handler error:", err);
    return NextResponse.redirect(`${siteUrl}/login?error=internal_server_error`);
  }
}
