import "server-only";
import { snapshot, type Snapshot } from "../schemas/analytics";
import { getDatabase } from "../storage/database";
import {
  serviceTargets,
  type Sample,
  type ServiceSummary,
} from "../monitoring/targets";
import { summarizeSamples } from "../monitoring/aggregate";

export function readStatus(): Snapshot<ServiceSummary[]> & {
  evaluatedAt: number;
} {
  try {
    const services = serviceTargets.map((target) => {
      const rows = getDatabase()
        .prepare(
          "SELECT * FROM samples WHERE service=? ORDER BY slot DESC LIMIT 8640",
        )
        .all(target.id);
      const samples: Sample[] = rows.map((row) => ({
        service: String(row.service),
        slot: Number(row.slot),
        checkedAt: String(row.checked_at),
        result: row.result as Sample["result"],
        statusCode: row.status_code === null ? null : Number(row.status_code),
        latencyMs: row.latency_ms === null ? null : Number(row.latency_ms),
      }));
      return {
        ...target,
        latest: samples[0] ?? null,
        recent: samples.slice(0, 48).reverse(),
        ...summarizeSamples(samples),
      };
    });
    const timestamps = services
      .map((service) => service.latest?.checkedAt)
      .filter((date): date is string => !!date)
      .sort();
    return {
      ...snapshot(services, timestamps[0] ?? null, 600_000),
      evaluatedAt: Date.now(),
    };
  } catch {
    return {
      ...snapshot<ServiceSummary[]>(null, null, 600_000),
      evaluatedAt: Date.now(),
    };
  }
}
