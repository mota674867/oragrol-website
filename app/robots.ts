import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The private application forms are invite-only: never listed, never crawled (they also send noindex headers).
      disallow: ["/apply/", "/api/apply/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
