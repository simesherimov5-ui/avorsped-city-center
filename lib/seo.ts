import type { Metadata } from "next";
import { truncate } from "@/lib/truncate";

export const SITE_NAME = "Јавор Шпед";

/**
 * The public address of the site. Set NEXT_PUBLIC_SITE_URL once there is a domain; until then Vercel's own address
 * is used on Vercel, and localhost in development. Canonical links, the sitemap and share images all build on it.
 */
export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

// Lives in its own file so a client component can use it without pulling in the rest of this one.
export { truncate };

/**
 * The metadata every page needs, in one place: its own title and description, a canonical link, and matching Open
 * Graph / Twitter tags (a page's own openGraph replaces the layout's, so it has to carry everything itself).
 * `title` is the page's own part ("Проекти"): the layout adds " | Јавор Шпед" to the browser title.
 */
export function pageMetadata({
  title,
  description,
  path,
  noindex = false,
  image = "/opengraph-image",
}: {
  title: string;
  description: string;
  /** The page's address without the domain, e.g. "/projects" or "/apartments/b01-f1-101". */
  path: string;
  noindex?: boolean;
  /**
   * The share image's address. A page that sets its own openGraph loses the file-based image of its folder, so a
   * page below /development or /dojran names that folder's image. Null where the page's own folder has the
   * opengraph-image file: leaving the image out lets it be added.
   */
  image?: string | null;
}): Metadata {
  const text = truncate(description);
  const social = `${title} | ${SITE_NAME}`;
  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: `${SITE_NAME} — Exclusive Building` }]
    : undefined;
  return {
    title,
    description: text,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: social,
      description: text,
      url: path,
      siteName: SITE_NAME,
      locale: "mk_MK",
      type: "website",
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: social,
      description: text,
      ...(images && { images: images.map((i) => i.url) }),
    },
  };
}
