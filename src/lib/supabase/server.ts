/**
 * Supabase client stubs.
 *
 * The project no longer uses Supabase Authentication or the Supabase SDK
 * for data access. All database queries now use the `postgres` client
 * in src/lib/db.ts connected directly to the PostgreSQL endpoint.
 *
 * These stubs are kept to avoid breaking any legacy imports during migration.
 * They are safe to delete once all legacy references are updated.
 */

export function createClient() {
  // This stub should not be called in the new architecture.
  // Use src/lib/db.ts (the postgres client) for all database operations.
  throw new Error(
    "createClient() from @/lib/supabase/server is no longer used. " +
    "Import { sql } from '@/lib/db' for database operations."
  );
}
