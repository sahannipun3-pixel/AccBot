import postgres from "postgres";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("[Test DB] DATABASE_URL is not set in environment or .env.local");
}

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

export const testSql = postgres({
  host,
  port,
  username,
  password,
  database,
  max: 5,
  idle_timeout: 10,
  connect_timeout: 15,
  prepare: false,
  ssl: "require",
});

export async function cleanupTestUser(email: string) {
  try {
    await testSql`DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE email = ${email.toLowerCase()})`;
    await testSql`DELETE FROM password_reset_tokens WHERE user_id IN (SELECT id FROM users WHERE email = ${email.toLowerCase()})`;
    await testSql`DELETE FROM users WHERE email = ${email.toLowerCase()}`;
  } catch (e) {
    console.error(`Failed to cleanup test user ${email}:`, e);
  }
}

export async function cleanupTestMessage(email: string) {
  try {
    await testSql`DELETE FROM contact_messages WHERE email = ${email.toLowerCase()}`;
  } catch (e) {
    console.error(`Failed to cleanup test message from ${email}:`, e);
  }
}

export async function cleanupTestEntity(table: string, nameColumn: string, nameValue: string) {
  try {
    await testSql.unsafe(`DELETE FROM ${table} WHERE ${nameColumn} = $1`, [nameValue]);
  } catch (e) {
    console.error(`Failed to cleanup test entity from ${table}:`, e);
  }
}
