import postgres from "postgres";

// ─── Connection String Validation ────────────────────────────────────────────

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "[AccBots DB] DATABASE_URL is missing. Add it to .env.local (dev) or Railway Variables (production)."
  );
}

// ─── Parse connection params explicitly ───────────────────────────────────────
// postgres.js URL parser misidentifies dotted usernames (e.g. postgres.projectref)
// as hostnames, producing the "ENOTFOUND tenant/user postgres.xxxx" error.
// Passing host/user/password/database as discrete options bypasses the parser.
const urlObj = new URL(
  connectionString.startsWith("postgres://")
    ? connectionString.replace("postgres://", "postgresql://")
    : connectionString
);

const host = urlObj.hostname;
const port = urlObj.port ? Number(urlObj.port) : 6543;
const username = decodeURIComponent(urlObj.username);
const password = decodeURIComponent(urlObj.password);
const database = urlObj.pathname.replace(/^\//, "") || "postgres";

// ─── Connection Pool ─────────────────────────────────────────────────────────

const sql = postgres({
  host,
  port,
  username,
  password,
  database,
  // Pool limits — keep low for Supabase Transaction Pooler (port 6543)
  max: 10,
  idle_timeout: 20,
  connect_timeout: 15,
  // SSL required for Supabase hosted PostgreSQL
  ssl: "require",
  // Graceful connection error handling
  onnotice: () => {}, // suppress NOTICE logs in production
});

export { sql };
export default sql;