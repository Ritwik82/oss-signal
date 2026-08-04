import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/data";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oss-signal.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects().projects;

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...projects.map((p) => ({
      url: `${baseUrl}/project/${encodeURIComponent(p.id)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];

  return entries.slice(0, 1000);
}
