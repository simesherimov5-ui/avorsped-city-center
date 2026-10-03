import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Exclusive Building`,
    short_name: SITE_NAME,
    start_url: "/",
    display: "browser",
    background_color: "rgb(250, 248, 245)",
    theme_color: "rgb(20, 20, 20)",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
