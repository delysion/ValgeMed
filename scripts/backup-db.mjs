import { spawnSync } from "node:child_process";
import { closeSync, openSync, renameSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const directory = process.env.VALGEMED_BACKUP_DIR;
if (!directory || !process.env.PGSERVICE) {
  throw new Error("Set VALGEMED_BACKUP_DIR and PGSERVICE before running a backup");
}

const stamp = new Date().toISOString().replaceAll(":", "-");
const destination = join(directory, "valgemed-" + stamp + ".dump");
const partial = destination + ".partial";

function run(program, args, stdout) {
  const result = spawnSync(program, args, { stdio: ["ignore", stdout, "inherit"] });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(program + " exited with status " + result.status);
}

const output = openSync(partial, "wx", 0o600);
try {
  try {
    run("pg_dump", ["--format=custom", "--no-owner", "--no-password"], output);
  } finally {
    closeSync(output);
  }
  run("pg_restore", ["--list", partial], "ignore");
  renameSync(partial, destination);
  console.log("Backup archive created:", destination);
} catch (error) {
  unlinkSync(partial);
  throw error;
}
