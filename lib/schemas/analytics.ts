import { z } from "zod";

export const languageSchema = z.object({
  name: z.string(),
  bytes: z.number().nonnegative(),
  share: z.number().min(0).max(100),
});
export const daySchema = z.object({
  date: z.iso.date(),
  count: z.number().int().nonnegative(),
});
export const analyticsSchema = z.object({
  username: z.string(),
  repositories: z.number().int().nonnegative(),
  stars: z.number().int().nonnegative(),
  includedRepositories: z.number().int().nonnegative(),
  languages: z.array(languageSchema),
  days: z.array(daySchema),
  contributions: z.number().int().nonnegative().nullable(),
  activitySource: z.enum(["github-graphql", "unavailable"]),
  partial: z.boolean(),
  collectedAt: z.iso.datetime(),
});
export type Analytics = z.infer<typeof analyticsSchema>;
export type Language = z.infer<typeof languageSchema>;
export type ActivityDay = z.infer<typeof daySchema>;
export type Snapshot<T> = {
  state: "fresh" | "stale" | "unavailable";
  collectedAt: string | null;
  data: T | null;
};

export function snapshot<T>(
  data: T | null,
  collectedAt: string | null,
  maxAgeMs: number,
  now = Date.now(),
): Snapshot<T> {
  return {
    state:
      !data || !collectedAt
        ? "unavailable"
        : now - Date.parse(collectedAt) > maxAgeMs
          ? "stale"
          : "fresh",
    collectedAt,
    data,
  };
}
