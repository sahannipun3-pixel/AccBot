import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase session middleware stub.
 *
 * The project no longer uses Supabase Authentication.
 * Supabase is used ONLY as a PostgreSQL database host.
 *
 * All session management is handled via custom JWT cookies.
 * This file is kept as a stub to avoid import errors from any
 * remaining references, but performs no auth-related work.
 */
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
