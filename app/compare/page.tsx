import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareView } from "./CompareView";

export const metadata: Metadata = {
  title: "Спореди станови",
  description: "Споредете до три станови од City Center една до друга: површина, спални соби, ориентација и цена.",
};

export default function ComparePage() {
  // The list can come from the address (?ids=…), which a statically built page may only read behind Suspense.
  return (
    <Suspense>
      <CompareView />
    </Suspense>
  );
}
