import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareView } from "./CompareView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Спореди станови",
  description: "Споредете до три станови од City Center една до друга: површина, спални соби, ориентација и цена.",
  path: "/compare",
  noindex: true, // the page shows whatever is in the address, so it is not worth indexing
});

export default function ComparePage() {
  // The list can come from the address (?ids=…), which a statically built page may only read behind Suspense.
  return (
    <Suspense>
      <CompareView />
    </Suspense>
  );
}
