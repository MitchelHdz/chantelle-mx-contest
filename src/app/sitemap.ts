import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chantelle-mx-contest.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/"].map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: new Date(),
  }));
}
