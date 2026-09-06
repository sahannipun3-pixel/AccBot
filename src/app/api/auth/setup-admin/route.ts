import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

/**
 * GET /api/auth/setup-admin
 *
 * One-time endpoint to create the first super_admin account.
 * Only works when NO super_admin exists in the database.
 * Disable or protect this route after initial setup.
 *
 * Usage: GET /api/auth/setup-admin?email=admin@accbot.com&password=Admin@Accbot2024!
 */
export async function GET(request: Request) {
  // Check if super_admin already exists — prevent reuse
  const [existing] = await sql<{ count: string }[]>`
    SELECT COUNT(*)::text as count FROM users WHERE role = 'super_admin'
  `;

  if (parseInt(existing?.count ?? "0", 10) > 0) {
    return NextResponse.json(
      { error: "A super_admin account already exists. This endpoint is disabled." },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const password = url.searchParams.get("password");
  const name = url.searchParams.get("name") ?? "Administrator";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Query params required: email, password, (optional) name" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await sql<{ id: string; email: string }[]>`
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES (${name}, ${email.toLowerCase()}, ${passwordHash}, 'super_admin')
    RETURNING id, email
  `;

  return NextResponse.json({
    success: true,
    message: "Super admin account created successfully. Please remove or secure this endpoint.",
    user: { id: user.id, email: user.email },
  });
}
