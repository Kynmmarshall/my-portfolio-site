import { INTERVAL_MS, type Sample } from "./targets.ts";
export function summarizeSamples(samples: Sample[], now = Date.now()) {
  const sorted = [...samples].sort((first, second) => first.slot - second.slot);
  const first = sorted[0];
  if (!first) return { availability: null, coverage: 0, observed: 0, expected: 0, since: null };
  const expected = Math.max(1, Math.floor(now / INTERVAL_MS) - first.slot + 1);
  const known = sorted.filter((sample) => sample.result !== "unknown");
  const successes = known.filter((sample) => sample.result === "reachable").length;
  return { availability: known.length >= 12 ? successes / known.length * 100 : null, coverage: Math.min(100, known.length / expected * 100), observed: known.length, expected, since: first.checkedAt };
}