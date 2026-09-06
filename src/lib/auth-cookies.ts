import { type NextRequest, NextResponse } from "next/server";
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

// ─── Cookie Names ─────────────────────────────────────────────────────────────
export const ACCESS_TOKEN_COOKIE = "accbot_access_token";
export const REFRESH_TOKEN_COOKIE = "accbot_refresh_token";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// ─── Set Auth Cookies on a Response ──────────────────────────────────────────
/**
 * Sets HttpOnly, SameSite=Lax auth cookies on a NextResponse.
 * In production, also sets Secure=true.
 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = false
): NextResponse {
  const secure = isProduction();

  // Access token — short-lived (15m)
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  // Refresh token — long-lived (7d or 30d for rememberMe)
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30d or 7d
  });

  return response;
}

// ─── Clear Auth Cookies ───────────────────────────────────────────────────────
/**
 * Deletes both auth cookies from a NextResponse.
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

// ─── Read Access Token from Incoming Request ──────────────────────────────────
/**
 * Reads the access token from an incoming NextRequest's cookies.
 */
export function getAccessTokenFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
}

/**
 * Reads the refresh token from an incoming NextRequest's cookies.
 */
export function getRefreshTokenFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
}

// ─── Read Access Token from Server Component Cookie Store ────────────────────
/**
 * Reads the access token from a Next.js server-side cookie store
 * (e.g. the result of `await cookies()` in a server component or action).
 */
export function getAccessTokenFromCookieStore(
  cookieStore: ReadonlyRequestCookies
): string | undefined {
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}
