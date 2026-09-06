import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";
import {
  getAccessTokenFromRequest,
  getRefreshTokenFromRequest,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth-cookies";

/**
 * AccBot Proxy — Pure JWT Route Protection with Automatic Token Refresh
 *
 * No Supabase Auth dependencies. Authentication is 100% based on
 * custom JWT cookies (accbot_access_token / accbot_refresh_token).
 *
 * Flow:
 *  1. Read access token from request cookies
 *  2. Verify JWT signature and expiry
 *  3. If access token expired but refresh token exists → call /api/auth/refresh
 *  4. Apply route guards (auth routes → redirect logged-in, protected → redirect guests)
 */
export async function proxy(request: NextRequest) {
  const accessToken = getAccessTokenFromRequest(request);
  const refreshToken = getRefreshTokenFromRequest(request);

  // ── Verify JWT ──────────────────────────────────────────────────────────────
  let isAuthenticated = false;
  let userRole: string | null = null;

  if (accessToken) {
    const payload = await verifyToken(accessToken);
    if (payload) {
      isAuthenticated = true;
      userRole = payload.role;
    }
  }

  const url = request.nextUrl.clone();

  // ── Route Definitions ────────────────────────────────────────────────────────
  const isAuthRoute = ["/login", "/signup", "/forgot-password", "/reset-password"].some(
    (path) => url.pathname.startsWith(path)
  );

  const isProtectedRoute = ["/profile", "/admin", "/expense-tracker", "/accounts-web"].some(
    (path) => url.pathname.startsWith(path)
  );

  const isAdminRoute = url.pathname.startsWith("/admin");

  // ── Token Refresh: If access token missing/expired but refresh token exists ───
  // Only attempt refresh for protected routes to avoid overhead on public pages
  if (!isAuthenticated && refreshToken && isProtectedRoute) {
    // Attempt token refresh by calling internal API
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    try {
      const refreshRes = await fetch(refreshUrl.toString(), {
        method: "POST",
        headers: {
          cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}`,
        },
      });

      if (refreshRes.ok) {
        // Refresh succeeded — allow the request through with new cookies applied
        const response = NextResponse.next();
        // Forward Set-Cookie headers from the refresh response
        const setCookieHeader = refreshRes.headers.get("set-cookie");
        if (setCookieHeader) {
          response.headers.set("set-cookie", setCookieHeader);
        }
        // Re-validate access token from response cookies
        const newAccessCookie = refreshRes.headers
          .get("set-cookie")
          ?.split(";")
          .find((c) => c.trim().startsWith(ACCESS_TOKEN_COOKIE));
        if (newAccessCookie) {
          const tokenValue = newAccessCookie.split("=").slice(1).join("=");
          const payload = await verifyToken(tokenValue);
          if (payload) {
            isAuthenticated = true;
            userRole = payload.role;
          }
        }
        if (isAuthenticated) {
          return response;
        }
      }
    } catch {
      // Refresh failed — fall through to redirect
    }
  }

  // ── Guards ───────────────────────────────────────────────────────────────────

  if (isAuthenticated && isAuthRoute) {
    // Logged-in users should not see login/signup pages
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  if (!isAuthenticated && isProtectedRoute) {
    // Guest users cannot access protected routes
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // ── Admin Role Guard ─────────────────────────────────────────────────────────
  if (isAuthenticated && isAdminRoute && userRole !== "admin" && userRole !== "super_admin") {
    // Authenticated but non-admin users cannot access admin routes
    url.pathname = "/profile";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export { proxy as middleware };
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico
     * - API routes (handle their own auth)
     * - public assets (svg, png, jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
