import * as fs from "fs";
import * as path from "path";

// Manually load .env
const envPath = path.resolve(".env");
if (fs.existsSync(envPath)) {
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
} else {
  console.error(".env file not found");
  process.exit(1);
}

import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(connectionString);

const tables = [
  "subjects",
  "exams",
  "topics",
  "study_sessions",
  "review_items",
  "error_logs",
  "quiz_attempts",
  "daily_logs",
  "goals",
  "tasks",
  "identity_notes",
  "tartu_notes",
  "time_blocks",
  "health_logs",
  "language_progress",
  "reputation_events",
  "opportunities",
  "professional_contacts",
  "life_admin_items",
  "portfolio_items",
  "strategic_reviews",
  "research_areas",
  "literature_gaps",
  "hypotheses",
  "manuscripts",
  "methodology_risks",
  "uploads",
  "push_subscriptions",
];

async function migrate() {
  console.log("Starting migration: add user_id to all tables...\n");

  for (const table of tables) {
    try {
      await sql.unsafe(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS user_id UUID;`);
      console.log(`  ✓ ${table}: user_id column added (or already exists)`);
    } catch (err: any) {
      console.error(`  ✗ ${table}: FAILED - ${err.message}`);
    }
  }

  console.log("\nMigration complete.");
  process.exit(0);
}

migrate();
