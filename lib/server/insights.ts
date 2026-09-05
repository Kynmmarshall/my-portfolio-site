import "server-only";
import { unstable_cache } from "next/cache";
import { collectGithub } from "../integrations/github";
import {
  analyticsSchema,
  snapshot,
  type Analytics,
  type Snapshot,
} from "../schemas/analytics";

const cachedGithub = unstable_cache(
  async () => {
    try {
      return await collectGithub();
    } catch {
      console.warn(
        "GitHub insights refresh failed; check GITHUB_TOKEN, API limits and connectivity.",
      );
      throw new Error("GitHub insights refresh failed");
    }
  },
  [
    "github-insights-v1",
    "Kynmmarshall",
    process.env.GITHUB_TOKEN ? "authenticated" : "public",
  ],
  { revalidate: 6 * 60 * 60, tags: ["github-insights"] },
);

export async function readInsights(): Promise<Snapshot<Analytics>> {
  try {
    const data = analyticsSchema.parse(await cachedGithub());
    return snapshot(data, data.collectedAt, 86_400_000);
  } catch {
    return snapshot<Analytics>(null, null, 86_400_000);
  }
}
