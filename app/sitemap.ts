import type { MetadataRoute } from "next";
import { apartments, buildings, projects } from "@/data";
import { dojranFloors } from "@/data/dojran";
import { siteUrl } from "@/lib/seo";

// Every public page. /compare (noindex) and /privacy (not published yet) are left out on purpose.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/projects",
    "/development",
    "/apartments",
    "/completed-projects",
    "/dojran",
    "/about",
    "/contact",
    ...projects.map((p) => `/projects/${p.slug}`),
    ...buildings.map((b) => `/development/${b.id}`),
    ...apartments.map((a) => `/apartments/${a.id}`),
    ...dojranFloors.map((f) => `/dojran/${f.number}`),
  ];
  return paths.map((path) => ({ url: `${siteUrl()}${path === "/" ? "" : path}` }));
}
