import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getAppUrl();
  const lastModified = new Date();

  return [
    {
      url: appUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${appUrl}/buffalo-waterfront.svg`],
    },
  ];
}
