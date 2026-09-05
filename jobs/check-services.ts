import { probe } from "../lib/monitoring/probe.ts";
import { INTERVAL_MS, serviceTargets } from "../lib/monitoring/targets.ts";
import { getDatabase, withJobLock } from "../lib/storage/database.ts";

await withJobLock("status", async () => {
  const slot = Math.floor(Date.now() / INTERVAL_MS);
  const database = getDatabase();
  for (let index = 0; index < serviceTargets.length; index += 2) {
    await Promise.all(serviceTargets.slice(index, index + 2).map(async (target) => {
      if (database.prepare("SELECT 1 FROM samples WHERE service=? AND slot=?").get(target.id, slot)) return;
      const result = await probe(new URL(target.url));
      database.prepare("INSERT OR IGNORE INTO samples VALUES (?, ?, ?, ?, ?, ?)").run(target.id, slot, new Date().toISOString(), result.result, result.statusCode, result.latencyMs);
      console.log(`${target.title}: ${result.result}${result.statusCode ? ` (${result.statusCode})` : ""}`);
    }));
  }
  database.prepare("DELETE FROM samples WHERE slot < ?").run(slot - 30 * 24 * 12);
});