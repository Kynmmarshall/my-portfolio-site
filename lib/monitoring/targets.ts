import { featuredProjects } from "../../content/projects.ts";
export const serviceTargets = featuredProjects.map((project) => ({
  id: project.slug,
  title: project.title,
  url: project.liveUrl,
}));
export const INTERVAL_MS = 300_000;
export type ServiceTarget = (typeof serviceTargets)[number];
export type ProbeResult = {
  result: "reachable" | "unreachable" | "unknown";
  statusCode: number | null;
  latencyMs: number | null;
};
export type Sample = ProbeResult & {
  service: string;
  slot: number;
  checkedAt: string;
};
export type ServiceSummary = ServiceTarget & {
  latest: Sample | null;
  recent: Sample[];
  availability: number | null;
  coverage: number;
  observed: number;
  expected: number;
  since: string | null;
};
