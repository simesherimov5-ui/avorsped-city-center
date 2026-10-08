import { FloorPicker, type PickerFloor } from "./FloorPicker";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * "Изберете кат" on a dark band: the floors of a building and, beside them, the apartments of the chosen floor. A floor
 * whose details are not here yet is passed with no apartments and its panel stays empty.
 */
export function FloorPickerSection({ floors, basePath }: { floors: PickerFloor[]; basePath?: string }) {
  return (
    <section className="bg-chrome py-12 text-on-chrome sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="Станови" title="Изберете кат" align="center" tone="dark" size="compact" />
        <div className="mt-10">
          <FloorPicker floors={floors} basePath={basePath} />
        </div>
      </div>
    </section>
  );
}
