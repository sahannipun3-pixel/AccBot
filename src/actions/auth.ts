"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { sql } from "@/lib/db";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginFormData,
  type SignupFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from "@/lib/validators";
import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/jwt";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookies";
import { sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email";
import type { User } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type DbUser = User & { password_hash: string };


// ─── Internal Helpers ─────────────────────────────────────────────────────────

/** Writes JWT cookies into the Next.js cookie store (server action context). */
async function persistJwtCookies(
  accessToken: string,
  refreshToken: string,
  rememberMe = false
) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
  });
}

/** Stores a hashed refresh token in the DB for revocation support. */
async function storeRefreshToken(userId: string, token: string, rememberMe: boolean) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(
    Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000
  ).toISOString();

  await sql`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES (${userId}, ${tokenHash}, ${expiresAt})
    ON CONFLICT (token_hash) DO NOTHING
  `;
}

/** Revokes a refresh token by its raw value. */
async function revokeRefreshToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  await sql`
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = ${tokenHash}
      AND revoked_at IS NULL
  `;
}

// ─── Sign Up with Email ───────────────────────────────────────────────────────

export async function signUpWithEmail(data: SignupFormData) {
  const result = signupSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "Invalid form data. Please check your inputs." };
  }

  const { name, email, phone, password } = result.data;

  // Check email uniqueness
  const existing = await sql<{ id: string }[]>`
    SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1
  `;
  if (existing.length > 0) {
    return { success: false, error: "An account with this email already exists." };
  }

  // Hash password (rounds=12)
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const [newUser] = await sql<Pick<DbUser, "id" | "email" | "role">[]>`
    INSERT INTO users (full_name, email, password_hash, phone, role)
    VALUES (${name.trim()}, ${email.toLowerCase()}, ${passwordHash}, ${phone || null}, 'user')
    RETURNING id, email, role
  `;

  if (!newUser) {
    return { success: false, error: "Failed to create account. Please try again." };
  }

  // Mint JWT tokens
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: newUser.id, email: newUser.email, role: newUser.role }),
    signRefreshToken({ sub: newUser.id, email: newUser.email, role: newUser.role }),
  ]);

  await persistJwtCookies(accessToken, refreshToken, false);
  await storeRefreshToken(newUser.id, refreshToken, false);

  // Fire welcome email (non-blocking)
  sendWelcomeEmail(email, name.trim()).catch(console.error);

  return { success: true };
}

// ─── Sign In with Email ───────────────────────────────────────────────────────

export async function signInWithEmail(data: LoginFormData) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "Invalid email or password." };
  }

  const { email, password, rememberMe } = result.data;

  // Find user by email
  const [user] = await sql<DbUser[]>`
    SELECT id, full_name, email, password_hash, role, is_active
    FROM users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `;

  if (!user) {
    // Use generic message to prevent user enumeration
    return { success: false, error: "Invalid email or password." };
  }

  if (!user.is_active) {
    return { success: false, error: "Your account has been deactivated. Please contact support." };
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return { success: false, error: "Invalid email or password." };
  }

  // Mint JWT tokens
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: user.id, email: user.email, role: user.role }),
    signRefreshToken({ sub: user.id, email: user.email, role: user.role, rememberMe }),
  ]);

  await persistJwtCookies(accessToken, refreshToken, rememberMe ?? false);
  await storeRefreshToken(user.id, refreshToken, rememberMe ?? false);

  return { success: true, role: user.role };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOutUser() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  // Revoke refresh token in DB
  if (refreshToken) {
    await revokeRefreshToken(refreshToken).catch(console.error);
  }

  // Clear cookies
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);

  redirect("/login");
}

// ─── Send Password Reset Email ────────────────────────────────────────────────

export async function sendPasswordReset(data: ForgotPasswordFormData) {
  const result = forgotPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: "Invalid email address." };
  }

  const { email } = result.data;

  // Find user — always return success to prevent email enumeration
  const [user] = await sql<Pick<DbUser, "id" | "full_name" | "email">[]>`
    SELECT id, full_name, email
    FROM users
    WHERE email = ${email.toLowerCase()} AND is_active = true
    LIMIT 1
  `;

  if (!user) {
    // Return success anyway to prevent enumeration
    return { success: true };
  }

  // Generate a secure random token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  // Store hashed token
  await sql`
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (${user.id}, ${tokenHash}, ${expiresAt})
  `;

  // Build reset link
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetLink = `${siteUrl}/reset-password?token=${rawToken}`;

  // Send email
  await sendPasswordResetEmail(user.email, user.full_name, resetLink);

  return { success: true };
}

// ─── Reset Password (from email link) ────────────────────────────────────────

export async function resetPassword(data: ResetPasswordFormData & { token: string }) {
  const { token, password, confirmPassword } = data;

  if (!token) {
    return { success: false, error: "Invalid or missing reset token." };
  }

  const schemaResult = resetPasswordSchema.safeParse({ password, confirmPassword });
  if (!schemaResult.success) {
    return { success: false, error: "Invalid passwords. Ensure they match and meet requirements." };
  }

  // Hash the token from the URL to compare with DB
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Find valid, unused, non-expired token
  const [resetRecord] = await sql<{ id: string; user_id: string }[]>`
    SELECT id, user_id
    FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
      AND expires_at > NOW()
      AND used_at IS NULL
    LIMIT 1
  `;

  if (!resetRecord) {
    return { success: false, error: "This reset link is invalid or has expired. Please request a new one." };
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, 12);

  // Update password + mark token as used (atomic)
  await sql.begin(async (tx) => {
    await tx`
      UPDATE users SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE id = ${resetRecord.user_id}
    `;
    await tx`
      UPDATE password_reset_tokens SET used_at = NOW()
      WHERE id = ${resetRecord.id}
    `;
  });

  // Clear any existing auth cookies
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);

  return { success: true };
}

// ─── Get Current Authenticated User ──────────────────────────────────────────

export async function getCurrentUser(): Promise<DbUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!accessToken) return null;

    const payload = await verifyToken(accessToken);
    if (!payload?.sub) return null;

    try {
      const [user] = await sql<DbUser[]>`
        SELECT id, full_name, email, phone, avatar_url, role, is_active, created_at, updated_at
        FROM users
        WHERE id = ${payload.sub} AND is_active = true
        LIMIT 1
      `;
      if (user) return user;
    } catch (err) {
      console.warn("Failed to query user from DB, using JWT session payload:", (err as Error).message);
    }

    return {
      id: payload.sub,
      full_name: payload.email ? payload.email.split("@")[0] : "User",
      email: payload.email || "user@accbot.lk",
      password_hash: "",
      phone: null,
      avatar_url: null,
      role: (payload.role as "super_admin" | "admin" | "user") || "user",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ─── Sign In with Google ───────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "insert-google-client-id-here";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectUri = `${siteUrl}/auth/callback`;

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent("openid email profile")}&access_type=offline&prompt=select_account`;

  redirect(googleAuthUrl);
}
