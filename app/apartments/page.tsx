import { placeOf, projectsOnSale } from "@/data";
import { ApartmentFinder } from "@/components/apartments/ApartmentFinder";
import { Button } from "@/components/ui/Button";
import { floorPlanImageForApartment } from "@/lib/assets";
import { parseChoices, sortForPage, type FinderApartment, type FinderBuilding } from "@/lib/apartment-finder";

type Params = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

// Every project on sale, in the order of the projects page, each with its buildings and apartments (a project with
// no apartments yet is one building with no floors). Nothing here knows which projects there are.
const sale = projectsOnSale();

const finderBuildings: FinderBuilding[] = sale.flatMap(({ project, buildings }) =>
  buildings.map((b) => ({
    id: b.id,
    name: b.name,
    project: project.name,
    projectId: project.id,
    projectHref: project.href ?? `/projects/${project.slug}`,
    coming: b.floors.length === 0,
    floors: b.floors,
  }))
);

const finderApartments: FinderApartment[] = sortForPage(
  sale.flatMap(({ apartments }) =>
    apartments.map((a) => ({
      id: a.id,
      projectId: a.projectId,
      buildingId: placeOf(a),
      floor: a.floor,
      number: a.number,
      bedrooms: a.bedrooms,
      area: a.area,
      status: a.status,
      plan: (({ src, alt, isPlaceholder }) => ({ src, alt, isPlaceholder }))(floorPlanImageForApartment(a)),
    }))
  ),
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
