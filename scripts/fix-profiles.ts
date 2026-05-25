import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(".env");
const lines = fs.readFileSync(envPath, "utf-8").split("\n");
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const eq = trimmed.indexOf("=");
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

async function main() {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_provider TEXT`;
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_api_key TEXT`;
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ`;
  const r = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='profiles'`;
  console.log("Columns:", r.map((c: any) => c.column_name).join(", "));
}

main().catch(console.error);
