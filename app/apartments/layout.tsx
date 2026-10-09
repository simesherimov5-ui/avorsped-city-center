import type { Metadata } from "next";
import { projectsOnSale } from "@/data";
import { availableWord } from "@/lib/plural";
import { availabilityCounts } from "@/data";
import { SITE_NAME, pageMetadata } from "@/lib/seo";

// The list page is a client component, so its metadata lives here.
const { available, total } = availabilityCounts(projectsOnSale().flatMap((p) => p.apartments));

const page = pageMetadata({
  title: "Пронајди стан",
  description: `Сите ${total} станови од проектите на Javor Sped Holding на едно место: ${available} ${availableWord(available)}. Изберете зграда, филтрирајте по површина и број на соби, па споредете ги.`,
  path: "/apartments",
});

// This layout sets the title, so it has to carry the site's " | Javor Sped Holding" ending for the pages below it too.
export const metadata: Metadata = {
  ...page,
  title: { default: "Пронајди стан", template: `%s | ${SITE_NAME}` },
};

export default function ApartmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
