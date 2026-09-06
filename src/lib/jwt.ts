import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ─── Token Payload Shape ───────────────────────────────────────────────────────
export interface TokenPayload extends JWTPayload {
  sub: string;   // user UUID
  email: string;
  role: string;  // 'user' | 'admin' | 'super_admin'
}

// ─── Secret Encoder ───────────────────────────────────────────────────────────
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET environment variable is missing or too short (minimum 32 characters)."
    );
  }
  return new TextEncoder().encode(secret);
}

// ─── Access Token (short-lived) ───────────────────────────────────────────────
/**
 * Signs a short-lived access token.
 * Expiry controlled by JWT_ACCESS_TOKEN_EXPIRY env var (default: 15m).
 */
export async function signAccessToken(payload: {
  sub: string;
  email: string;
  role: string;
}): Promise<string> {
  const expiry = (process.env.JWT_ACCESS_TOKEN_EXPIRY as Parameters<SignJWT["setExpirationTime"]>[0]) ?? "15m";
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer("accbot")
    .setAudience("accbot-client")
    .setExpirationTime(expiry)
    .sign(getSecret());
}

// ─── Refresh Token (long-lived) ───────────────────────────────────────────────
/**
 * Signs a long-lived refresh token.
 * @param rememberMe - If true, uses 30d expiry; otherwise JWT_REFRESH_TOKEN_EXPIRY (default: 7d).
 */
export async function signRefreshToken(payload: {
  sub: string;
  email: string;
  role: string;
  rememberMe?: boolean;
}): Promise<string> {
  const expiry = payload.rememberMe
    ? "30d"
    : ((process.env.JWT_REFRESH_TOKEN_EXPIRY as Parameters<SignJWT["setExpirationTime"]>[0]) ?? "7d");
  return new SignJWT({ email: payload.email, role: payload.role, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer("accbot")
    .setAudience("accbot-client")
    .setExpirationTime(expiry)
    .sign(getSecret());
}

// ─── Token Verification ───────────────────────────────────────────────────────
/**
 * Verifies a JWT token (access or refresh).
 * Returns the decoded payload, or null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "accbot",
      audience: "accbot-client",
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
