import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { getTableColumns, getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { schema } from "@/lib/db/schema";

type Journal = {
  entries: Array<{ idx: number; tag: string }>;
};

type Snapshot = {
  tables: Record<
    string,
    {
      columns: Record<
        string,
        {
          name: string;
          notNull: boolean;
          type: string;
        }
      >;
    }
  >;
};

const rootDir = path.resolve(import.meta.dirname, "..");
const drizzleDir = path.join(rootDir, "drizzle");
const metaDir = path.join(drizzleDir, "meta");

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function getLatestSnapshot() {
  const journal = readJson<Journal>(path.join(metaDir, "_journal.json"));
  const latest = journal.entries.at(-1);

  expect(latest, "drizzle journal should contain at least one entry").toBeDefined();

  return readJson<Snapshot>(
    path.join(metaDir, `${String(latest!.idx).padStart(4, "0")}_snapshot.json`),
  );
}

describe("drizzle migrations", () => {
  it("has migration SQL and snapshot files for every journal entry", () => {
    const journal = readJson<Journal>(path.join(metaDir, "_journal.json"));

    for (const entry of journal.entries) {
      const idx = String(entry.idx).padStart(4, "0");

      expect(existsSync(path.join(drizzleDir, `${entry.tag}.sql`))).toBe(true);
      expect(existsSync(path.join(metaDir, `${idx}_snapshot.json`))).toBe(true);
    }
  });

  it("keeps user-scoped table snapshots aligned with the TypeScript schema", () => {
    const snapshot = getLatestSnapshot();

    for (const table of Object.values(schema)) {
      const columns = getTableColumns(table);

      if (!("userId" in columns)) {
        continue;
      }

      const tableName = getTableName(table);
      const snapshotTable = snapshot.tables[`public.${tableName}`];

      expect(snapshotTable, `${tableName} should exist in the latest snapshot`).toBeDefined();
      expect(snapshotTable.columns.user_id, `${tableName}.user_id should be migrated`).toMatchObject({
        name: "user_id",
        notNull: true,
        type: "uuid",
      });
    }
  });
});
