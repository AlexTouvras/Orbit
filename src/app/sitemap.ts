import type { MetadataRoute } from "next";
import { listManifestSlugs, loadStoryManifest } from "@/lib/loadStory";
import { getWriteModifiedDate } from "@/lib/seo/writes";
import { getSiteUrl } from "@/lib/site";
import { getAllWrites } from "@/lib/writes";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/writes`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/portfolio`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/stories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${base}/portfolio/live`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${base}/portfolio/live/nordic-equity`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.7,
    },
    {
      url: `${base}/portfolio/live/eu-spot`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${base}/portfolio/live/housing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/portfolio/live/power-mix`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${base}/portfolio/live/economy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/card`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${base}/newsletter`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/radar`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${base}/field-card/index.html`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/analytics-field-card/index.html`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/delivery-field-card/index.html`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/sdlc-field-card/index.html`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/credit-risk-field-card/index.html`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/story-field-card/index.html`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${base}/bayes-field-card/index.html`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const writes = getAllWrites().map((write) => ({
    url: `${base}/writes/${write.slug}`,
    lastModified: new Date(getWriteModifiedDate(write)),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const stories = listManifestSlugs()
    .map((slug) => {
      try {
        return loadStoryManifest(slug);
      } catch {
        return null;
      }
    })
    .filter(
      (m): m is NonNullable<typeof m> =>
        m !== null && m.meta.role !== "fixture",
    )
    .map((manifest) => ({
      url: `${base}/stories/${manifest.meta.slug}`,
      lastModified: new Date(manifest.meta.date),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    }));

  return [...staticRoutes, ...writes, ...stories];
}
