import { FloorPicker, type PickerFloor } from "./FloorPicker";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * "Изберете кат" on a dark band: the floors of a building and, beside them, the apartments of the chosen floor. A floor
 * whose details are not here yet is passed with no apartments and its panel says so.
 */
export function FloorPickerSection({ floors, basePath }: { floors: PickerFloor[]; basePath?: string }) {
  return (
    <section className="bg-chrome py-12 text-on-chrome sm:py-16">
      <div className="container-x">
        <SectionHeading eyebrow="Станови" title="Изберете кат" align="center" tone="dark" size="compact" />
        <div className="mt-10">
          <FloorPicker floors={floors} basePath={basePath} />
        </div>
      </div>
    </section>
  );
}
