import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    ...(process.env.SITE_URL
      ? { sitemap: new URL("/sitemap.xml", process.env.SITE_URL).href }
      : {}),
  };
}
