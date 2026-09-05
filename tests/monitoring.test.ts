import { test } from "node:test";
import assert from "node:assert/strict";
import { allowedTarget, isPublicAddress } from "../lib/monitoring/probe.ts";
import { summarizeSamples } from "../lib/monitoring/aggregate.ts";
import { INTERVAL_MS, type Sample } from "../lib/monitoring/targets.ts";

test("probes reject arbitrary hosts and private or reserved destinations", () => {
  assert.ok(allowedTarget(new URL("https://batchit.duckdns.org/path")));
  for (const target of [
    "http://batchit.duckdns.org",
    "https://localhost",
    "https://example.com",
    "https://batchit.duckdns.org:9000",
    "https://user:pass@batchit.duckdns.org",
  ])
    assert.equal(allowedTarget(new URL(target)), false);
  for (const address of [
    "127.0.0.1",
    "10.1.1.1",
    "192.168.1.2",
    "169.254.169.254",
    "100.64.0.1",
    "::1",
    "224.0.0.1",
  ])
    assert.equal(isPublicAddress(address), false);
  assert.ok(isPublicAddress("8.8.8.8"));
});
test("missing probes never inflate observed coverage or invent uptime", () => {
  const sample: Sample = {
    service: "batchit",
    slot: 0,
    checkedAt: new Date(0).toISOString(),
    result: "reachable",
    statusCode: 200,
    latencyMs: 100,
  };
  assert.equal(summarizeSamples([sample], INTERVAL_MS * 9).coverage, 10);
  assert.equal(summarizeSamples([sample], INTERVAL_MS * 9).availability, null);
  assert.equal(summarizeSamples([], 0).availability, null);
  const samples = Array.from({ length: 12 }, (_, index) => ({
    ...sample,
    slot: index,
    result: index === 0 ? ("unreachable" as const) : ("reachable" as const),
  }));
  assert.equal(
    summarizeSamples(samples, INTERVAL_MS * 11).availability,
    (11 / 12) * 100,
  );
});
