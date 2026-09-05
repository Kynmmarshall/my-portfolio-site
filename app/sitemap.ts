import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!process.env.SITE_URL) return [];
  return [
    "",
    "/projects",
    "/expertise",
    "/insights",
    "/resume",
    "/privacy",
    ...projects.map((project) => `/projects/${project.slug}`),
  ].map((path) => ({ url: new URL(path || "/", process.env.SITE_URL).href }));
}
