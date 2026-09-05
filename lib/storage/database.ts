import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { ZodType } from "zod";

let database: DatabaseSync | undefined;
export function getDatabase() {
  if (database) return database;
  const path =
    process.env.PORTFOLIO_DB_PATH ||
    join(process.cwd(), ".data", "portfolio.sqlite");
  mkdirSync(dirname(path), { recursive: true });
  database = new DatabaseSync(path);
  database.exec(`PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS snapshots (key TEXT PRIMARY KEY, payload TEXT NOT NULL, collected_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS samples (service TEXT NOT NULL, slot INTEGER NOT NULL, checked_at TEXT NOT NULL, result TEXT NOT NULL, status_code INTEGER, latency_ms INTEGER, PRIMARY KEY(service, slot));
    CREATE TABLE IF NOT EXISTS locks (key TEXT PRIMARY KEY, token TEXT NOT NULL, expires_at INTEGER NOT NULL);`);
  return database;
}
export function saveSnapshot(key: string, data: unknown, collectedAt: string) {
  getDatabase()
    .prepare(
      "INSERT INTO snapshots VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload, collected_at=excluded.collected_at",
    )
    .run(key, JSON.stringify(data), collectedAt);
}
export function readSnapshot<T>(
  key: string,
  schema: ZodType<T>,
): { data: T; collectedAt: string } | null {
  const row = getDatabase()
    .prepare("SELECT payload, collected_at FROM snapshots WHERE key=?")
    .get(key);
  if (!row) return null;
  try {
    return {
      data: schema.parse(JSON.parse(String(row.payload))),
      collectedAt: String(row.collected_at),
    };
  } catch {
    return null;
  }
}
export async function withJobLock(key: string, work: () => Promise<void>) {
  const db = getDatabase();
  const token = randomUUID();
  const now = Date.now();
  const result = db
    .prepare(
      "INSERT INTO locks VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET token=excluded.token, expires_at=excluded.expires_at WHERE locks.expires_at < ?",
    )
    .run(key, token, now + 15 * 60_000, now);
  if (!result.changes) {
    console.log(`${key}: another refresh is in progress`);
    return;
  }
  try {
    await work();
  } finally {
    db.prepare("DELETE FROM locks WHERE key=? AND token=?").run(key, token);
  }
}
