import { seedFor, type FinderApartment, type FinderBuilding } from "@/lib/apartment-finder";

const STATUS_CLASS = { available: "free", reserved: "res", sold: "sold" } as const;

/**
 * A building as a small drawing: a base bar, a body with one row per floor (the top floor at the top) and one window
 * per apartment, and a cap on the roof. Everything is sized from `--u` (a window's width), set by whoever draws it.
 * `highlight` is the id of one apartment whose window is picked out (the pop-up's «where it is»).
 */
export function Tower({
  building,
  apartments,
  highlight,
}: {
  building: FinderBuilding;
  apartments: Map<string, FinderApartment>;
  highlight?: string;
}) {
  return (
    <span className="af-tw">
      <span className="af-cap" />
      <span className={`af-body${building.coming ? " is-empty" : ""}`}>
        {[...building.floors]
          .sort((a, b) => b.number - a.number)
          .map((floor) => (
            <span key={floor.number} className="af-fl">
              {floor.apartmentIds.map((id) => {
                const apartment = apartments.get(id);
                if (!apartment) return null;
                return (
                  <i
                    key={id}
                    className={`af-win ${STATUS_CLASS[apartment.status]}${highlight === id ? " hi" : ""}`}
                    style={{ "--r": seedFor(id).toFixed(3) } as React.CSSProperties}
                  />
                );
              })}
            </span>
          ))}
      </span>
      <span className="af-base" />
    </span>
  );
}
