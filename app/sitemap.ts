import type { MetadataRoute } from "next";

const BASE_URL = "https://oragrolglobal.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/business-automation", priority: 0.9 },
    { path: "/or-one", priority: 0.9 },
    { path: "/industries", priority: 0.8 },
    { path: "/resources", priority: 0.7 },
    { path: "/company", priority: 0.6 },
    { path: "/cyber-health", priority: 0.8 },
    { path: "/faq", priority: 0.6 },
    { path: "/contact", priority: 0.7 },
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    priority: route.priority,
  }));
}
