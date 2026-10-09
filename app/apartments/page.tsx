import { apartments, buildings, projects } from "@/data";
import { ApartmentFinder } from "@/components/apartments/ApartmentFinder";
import { Button } from "@/components/ui/Button";
import { floorPlanImageForApartment } from "@/lib/assets";
import { parseChoices, sortForPage, type FinderApartment, type FinderBuilding } from "@/lib/apartment-finder";

type Params = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// The buildings that have apartments, in the order of the data, with the project each belongs to.
const finderBuildings: FinderBuilding[] = buildings
  .filter((b) => apartments.some((a) => a.buildingId === b.id))
  .map((b) => ({
    id: b.id,
    name: b.name,
    project: projects.find((p) => p.buildings?.some((x) => x.id === b.id))?.name ?? b.name,
    floors: b.floors.map((f) => ({
      number: f.number,
      label: f.label,
      apartmentIds: apartments.filter((a) => a.buildingId === b.id && a.floor === f.number).map((a) => a.id),
    })),
  }));

const finderApartments: FinderApartment[] = sortForPage(
  apartments.map((a) => ({
    id: a.id,
    buildingId: a.buildingId,
    floor: a.floor,
    number: a.number,
    bedrooms: a.bedrooms,
    area: a.area,
    status: a.status,
    plan: (({ src, alt, isPlaceholder }) => ({ src, alt, isPlaceholder }))(floorPlanImageForApartment(a)),
  })),
  finderBuildings.map((b) => b.id)
);

/** Пронајди стан: choose a building on the street, narrow the list, open an apartment (design board: pronajdi-stan-ulica). */
export default async function ApartmentsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const initial = parseChoices(
    { get: (name) => first(params[name]) ?? null },
    finderApartments,
    finderBuildings.map((b) => b.id)
  );

  return (
    <>
      <ApartmentFinder buildings={finderBuildings} apartments={finderApartments} initial={initial} />

      <section className="af-close af-gut">
        <div className="af-wrap af-close-in">
          <div>
            <div className="eyebrow">Лична консултација</div>
            <h2>Сите детали за станот, лично од нашиот тим.</h2>
          </div>
          <Button href="/contact" variant="primary" tone="dark">
            Закажи консултација
          </Button>
        </div>
      </section>
    </>
  );
}
