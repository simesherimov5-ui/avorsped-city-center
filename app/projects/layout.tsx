import type { Metadata } from "next";
import { SITE_NAME, pageMetadata } from "@/lib/seo";

// The list page is a client component, so its metadata lives here.
const page = pageMetadata({
  title: "Проекти",
  description:
    "Станбените проекти на Јавор Шпед: од првата станбена зграда до City Center, комплексот што е во изградба.",
  path: "/projects",
});

// This layout sets the title, so it has to carry the site's " | Јавор Шпед" ending for the pages below it too.
export const metadata: Metadata = { ...page, title: { default: "Проекти", template: `%s | ${SITE_NAME}` } };

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
