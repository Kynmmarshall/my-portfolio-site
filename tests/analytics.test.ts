import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aggregateLanguages,
  weeklyActivity,
} from "../lib/analytics/aggregate.ts";
import { snapshot } from "../lib/schemas/analytics.ts";

test("languages aggregate bytes across repositories and preserve Other", () => {
  const result = aggregateLanguages([
    { Dart: 100, Python: 50 },
    { Dart: 50, C: 10, Java: 10, HTML: 10, CSS: 10, TeX: 10 },
  ]);
  assert.equal(result[0].name, "Dart");
  assert.equal(result[0].share, 60);
  assert.equal(result.at(-1)?.name, "Other");
  assert.equal(
    result.reduce((sum, language) => sum + language.share, 0),
    100,
  );
  assert.deepEqual(aggregateLanguages([{}]), []);
});
test("weekly contributions use UTC Sunday boundaries", () => {
  assert.deepEqual(
    weeklyActivity([
      { date: "2024-02-29", count: 3 },
      { date: "2024-03-02", count: 2 },
      { date: "2024-03-03", count: 1 },
    ]),
    [
      { date: "2024-02-25", count: 5 },
      { date: "2024-03-03", count: 1 },
    ],
  );
});
test("snapshots distinguish unavailable, stale and fresh", () => {
  assert.equal(snapshot(null, null, 1000, 2000).state, "unavailable");
  assert.equal(
    snapshot({}, new Date(0).toISOString(), 1000, 2000).state,
    "stale",
  );
  assert.equal(
    snapshot({}, new Date(1500).toISOString(), 1000, 2000).state,
    "fresh",
  );
});
