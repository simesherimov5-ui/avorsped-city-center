import type { Metadata } from "next";
import { apartments } from "@/data";
import { availableWord } from "@/lib/plural";
import { availabilityCounts } from "@/data";
import { SITE_NAME, pageMetadata } from "@/lib/seo";

// The list page is a client component, so its metadata lives here.
const { available, total } = availabilityCounts(apartments);

const page = pageMetadata({
  title: "Станови во City Center",
  description: `Сите ${total} станови во City Center на едно место: ${available} ${availableWord(available)}. Филтрирајте по зграда, површина и број на соби, па споредете ги.`,
  path: "/apartments",
});

// This layout sets the title, so it has to carry the site's " | Јавор Шпед" ending for the pages below it too.
export const metadata: Metadata = {
  ...page,
  title: { default: "Станови во City Center", template: `%s | ${SITE_NAME}` },
};

export default function ApartmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
