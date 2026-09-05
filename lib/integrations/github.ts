import { z } from "zod";
import { aggregateLanguages } from "../analytics/aggregate.ts";
import {
  analyticsSchema,
  type Analytics,
  type ActivityDay,
} from "../schemas/analytics.ts";
import { readSnapshot, saveSnapshot } from "../storage/database.ts";

const repositorySchema = z.object({
  name: z.string(),
  fork: z.boolean(),
  archived: z.boolean(),
  private: z.boolean(),
  stargazers_count: z.number(),
  owner: z.object({ login: z.string() }),
});
const languageMap = z.record(z.string(), z.number().nonnegative());
const calendarSchema = z.object({
  data: z.object({
    user: z.object({
      contributionsCollection: z.object({
        contributionCalendar: z.object({
          totalContributions: z.number(),
          weeks: z.array(
            z.object({
              contributionDays: z.array(
                z.object({ date: z.iso.date(), contributionCount: z.number() }),
              ),
            }),
          ),
        }),
      }),
    }),
  }),
});
const username = "Kynmmarshall";

async function githubJson(path: string, body?: unknown): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Kynmmarshall-Portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com${path}`, {
    headers,
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      `GitHub HTTP ${response.status}; preserving last successful snapshot`,
    );
  return response.json();
}

export async function collectGithub(): Promise<Analytics> {
  const repositories: z.infer<typeof repositorySchema>[] = [];
  for (let page = 1; page <= 100; page++) {
    const batch = z
      .array(repositorySchema)
      .parse(
        await githubJson(
          `/users/${username}/repos?type=owner&per_page=100&page=${page}`,
        ),
      );
    repositories.push(...batch);
    if (batch.length < 100) break;
    if (page === 100) throw new Error("Repository pagination limit exceeded");
  }
  const included = repositories.filter(
    (repo) =>
      !repo.fork &&
      !repo.archived &&
      !repo.private &&
      repo.owner.login.toLowerCase() === username.toLowerCase(),
  );
  const languages: Record<string, number>[] = [];
  let partial = false;
  for (const repository of included) {
    const key = `languages:${repository.name}`;
    const cached = readSnapshot(key, languageMap);
    if (cached && Date.now() - Date.parse(cached.collectedAt) < 86_400_000) {
      languages.push(cached.data);
      continue;
    }
    try {
      const data = languageMap.parse(
        await githubJson(
          `/repos/${username}/${encodeURIComponent(repository.name)}/languages`,
        ),
      );
      languages.push(data);
      saveSnapshot(key, data, new Date().toISOString());
    } catch {
      partial = true;
      if (cached) languages.push(cached.data);
      break;
    }
  }
  const previous = readSnapshot("github", analyticsSchema);
  let days: ActivityDay[] = [];
  let contributions: number | null = null;
  let activitySource: Analytics["activitySource"] = "unavailable";
  if (process.env.GITHUB_TOKEN) {
    try {
      const response = calendarSchema.parse(
        await githubJson("/graphql", {
          query: `query { user(login: "${username}") { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }`,
        }),
      );
      const calendar =
        response.data.user.contributionsCollection.contributionCalendar;
      days = calendar.weeks.flatMap((week) =>
        week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
        })),
      );
      contributions = calendar.totalContributions;
      activitySource = "github-graphql";
    } catch {
      partial = true;
    }
  }
  if (partial && previous)
    throw new Error(
      "Partial GitHub refresh; retaining the complete last-good snapshot",
    );
  return analyticsSchema.parse({
    username,
    repositories: repositories.length,
    stars: repositories.reduce(
      (total, repo) => total + repo.stargazers_count,
      0,
    ),
    includedRepositories: included.length,
    languages: aggregateLanguages(languages),
    days,
    contributions,
    activitySource,
    partial,
    collectedAt: new Date().toISOString(),
  });
}
