import { test } from "node:test";
import assert from "node:assert/strict";
import { collectGithub } from "../lib/integrations/github.ts";

const repository = {
  name: "portfolio",
  fork: false,
  archived: false,
  private: false,
  stargazers_count: 3,
  owner: { login: "Kynmmarshall" },
};

test("GitHub collection needs no database or token for public figures", async (context) => {
  const token = process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_TOKEN;
  context.after(() => {
    if (token === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = token;
  });
  const paths: string[] = [];
  context.mock.method(
    globalThis,
    "fetch",
    async (input: string, init: RequestInit) => {
      paths.push(input);
      assert.equal(new Headers(init.headers).has("Authorization"), false);
      assert.equal(init.cache, "no-store");
      assert.ok(init.signal);
      if (input.includes("/users/"))
        return Response.json([
          repository,
          { ...repository, name: "fork", fork: true },
          { ...repository, name: "archive", archived: true },
        ]);
      assert.ok(input.endsWith("/portfolio/languages"));
      return Response.json({ TypeScript: 200, CSS: 100 });
    },
  );
  const result = await collectGithub();
  assert.equal(result.repositories, 3);
  assert.equal(result.stars, 9);
  assert.equal(result.includedRepositories, 1);
  assert.equal(result.languages[0].name, "TypeScript");
  assert.equal(result.contributions, null);
  assert.equal(result.activitySource, "unavailable");
  assert.equal(result.partial, false);
  assert.equal(paths.length, 2);
});

test("authenticated collection includes the calendar without exposing the token", async (context) => {
  const token = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = "test-token-not-a-secret";
  context.after(() => {
    if (token === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = token;
  });
  context.mock.method(
    globalThis,
    "fetch",
    async (input: string, init: RequestInit) => {
      assert.equal(
        new Headers(init.headers).get("Authorization"),
        "Bearer test-token-not-a-secret",
      );
      if (input.includes("/users/")) return Response.json([repository]);
      if (input.endsWith("/languages"))
        return Response.json({ TypeScript: 200 });
      assert.ok(input.endsWith("/graphql"));
      assert.equal(init.method, "POST");
      return Response.json({
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: {
                totalContributions: 12,
                weeks: [
                  {
                    contributionDays: [
                      { date: "2026-09-01", contributionCount: 12 },
                    ],
                  },
                ],
              },
            },
          },
        },
      });
    },
  );
  const result = await collectGithub();
  assert.equal(result.contributions, 12);
  assert.deepEqual(result.days, [{ date: "2026-09-01", count: 12 }]);
  assert.equal(result.activitySource, "github-graphql");
  assert.equal(JSON.stringify(result).includes("test-token"), false);
});

test("failed language requests reject instead of publishing partial snapshots", async (context) => {
  context.mock.method(globalThis, "fetch", async (input: string) =>
    input.includes("/users/")
      ? Response.json([repository])
      : new Response("rate limited", { status: 403 }),
  );
  await assert.rejects(collectGithub(), /GitHub HTTP 403/);
});

test("repository pagination is collected before aggregation", async (context) => {
  const token = process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_TOKEN;
  context.after(() => {
    if (token === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = token;
  });
  context.mock.method(globalThis, "fetch", async (input: string) => {
    if (input.endsWith("page=1"))
      return Response.json(
        Array.from({ length: 100 }, (_, index) => ({
          ...repository,
          name: `archive-${index}`,
          archived: true,
        })),
      );
    if (input.endsWith("page=2")) return Response.json([repository]);
    return Response.json({ CSS: 20 });
  });
  assert.equal((await collectGithub()).repositories, 101);
});
