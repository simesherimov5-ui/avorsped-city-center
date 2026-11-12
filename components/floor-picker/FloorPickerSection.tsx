import { FloorPicker, type PickerFloor } from "./FloorPicker";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * "Изберете кат" on a cream band (.fp-band, with the light-surface tokens of .on-light): the floors of a building and, beside them, the apartments of the chosen floor. A floor
 * whose details are not here yet is passed with no apartments and its panel says so.
 */
export function FloorPickerSection({ floors, basePath }: { floors: PickerFloor[]; basePath?: string }) {
  return (
    <section className="on-light fp-band py-12 sm:py-16">
      {/* wider than the page's 1200px content, so the floor plan is about 15% bigger from 1440px */}
      <div className="mx-auto max-w-[1448px] px-5 sm:px-8">
        <SectionHeading eyebrow="Станови" title="Изберете кат" align="center" size="compact" />
        <div className="mt-10">
          <FloorPicker floors={floors} basePath={basePath} />
        </div>
      </div>
    </section>
  );
}
