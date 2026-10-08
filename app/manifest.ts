import type { MetadataRoute } from "next";

/** Web app manifest: approved Oragrol Global icon (2026-10-09 logo handoff). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oragrol Global",
    short_name: "Oragrol",
    start_url: "/",
    display: "browser",
    background_color: "#E9E5DC",
    theme_color: "#141719",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
