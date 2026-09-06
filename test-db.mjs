import postgres from "postgres";

// Load connection string strictly from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("[test-db] Error: DATABASE_URL environment variable is not defined.");
  console.error("Please ensure DATABASE_URL is set in .env.local or exported in your shell.");
  process.exit(1);
}

console.log("\n[test-db] Testing PostgreSQL connection from environment variable...");

const sql = postgres(connectionString, {
  ssl: "require",
  connect_timeout: 10,
});

try {
  const res = await sql`SELECT NOW() as current_time`;
  console.log("--> SUCCESS! Database connection established:", res[0]?.current_time);

  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name ASC
  `;
  console.log("--> Public Tables:", tables.map((t) => t.table_name));
  await sql.end();
} catch (e) {
  console.error("--> Connection Failed:", e.message);
  await sql.end().catch(() => {});
  process.exit(1);
}
