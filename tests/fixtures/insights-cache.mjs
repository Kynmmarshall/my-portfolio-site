import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";

Object.assign(globalThis, { AsyncLocalStorage });
process.env.GITHUB_TOKEN = "cache-test-token";
const { workAsyncStorage } =
  await import("next/dist/server/app-render/work-async-storage.external.js");
const { readInsights } = await import("../../lib/server/insights.ts");
const entries = new Map();
let now = Date.now();
let fail = true;
let calls = 0;
let stars = 3;
const cache = {
  async generateSimpleCacheKey(key) {
    assert.equal(key.includes("cache-test-token"), false);
    return key;
  },
  async get(key) {
    const entry = entries.get(key);
    return entry
      ? {
          value: entry.value,
          isStale: now - entry.createdAt > entry.value.revalidate * 1000,
        }
      : null;
  },
  async set(key, value) {
    assert.equal(value.revalidate, 21600);
    entries.set(key, { value, createdAt: now });
  },
};
globalThis.fetch = async (input, options) => {
  calls++;
  assert.equal(
    new Headers(options.headers).get("Authorization"),
    "Bearer cache-test-token",
  );
  if (fail) return new Response("unavailable", { status: 503 });
  if (input.includes("/users/"))
    return Response.json([
      {
        name: "portfolio",
        fork: false,
        archived: false,
        private: false,
        stargazers_count: stars,
        owner: { login: "Kynmmarshall" },
      },
    ]);
  if (input.endsWith("/languages")) return Response.json({ TypeScript: 100 });
  assert.ok(input.endsWith("/graphql"));
  return Response.json({
    data: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: 7,
            weeks: [
              {
                contributionDays: [
                  { date: "2026-09-01", contributionCount: 7 },
                ],
              },
            ],
          },
        },
      },
    },
  });
};
const logs = [];
console.warn = (...messages) => logs.push(messages.join(" "));
console.error = (...messages) => logs.push(messages.join(" "));

async function request() {
  const store = {
    route: "/insights",
    isStaticGeneration: false,
    incrementalCache: cache,
    pendingRevalidates: {},
  };
  const result = await workAsyncStorage.run(store, readInsights);
  await Promise.all(Object.values(store.pendingRevalidates));
  assert.equal(JSON.stringify(result).includes("cache-test-token"), false);
  return result;
}

assert.equal((await request()).state, "unavailable");
assert.equal(entries.size, 0);
fail = false;
const first = await request();
assert.equal(first.data.repositories, 1);
assert.equal(first.data.contributions, 7);
assert.equal(entries.size, 1);
const coldCalls = calls;
assert.deepEqual(await request(), first);
assert.equal(calls, coldCalls);

now += 21601 * 1000;
fail = true;
assert.deepEqual(await request(), first);
assert.ok(calls > coldCalls);
assert.equal(
  JSON.parse([...entries.values()][0].value.data.body).collectedAt,
  first.collectedAt,
);

fail = false;
stars = 9;
assert.deepEqual(await request(), first);
const refreshed = await request();
assert.equal(refreshed.data.stars, 9);
assert.equal(
  logs.some((message) => message.includes("cache-test-token")),
  false,
);
console.log(
  "Next Data Cache: cold failure, six-hour reuse, stale fallback, recovery and token isolation passed",
);
