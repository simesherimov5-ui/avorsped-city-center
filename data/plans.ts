import type { Apartment, ApartmentOutline, Floor, Room } from "@/types";
import { unitSlug } from "./slug";

/**
 * The architect's plans of a project's buildings, as the drawings' data file gives them (data/plans/<project>.json):
 * building by building, floor by floor, apartment by apartment. This turns them into the site's own data. It knows
 * nothing about any one project: any building of any project that gets a file of this kind appears the same way.
 */
export interface PlansFile {
  buildings: {
    building: number;
    architectName: string;
    floors: {
      floor: number;
      name: string;
      /** The floor's own sketch, a path inside the folder of the images. */
      sketch: string;
      sketchWidth: number;
      sketchHeight: number;
      apartments: {
        number: string;
        /** The word on the drawing ("трособен"). */
        type: string;
        rooms: number;
        area: number;
        spaces: { name: string; area: number }[];
        plan: string;
        planWidth: number;
        planHeight: number;
        /** Percent of the floor sketch: x from the left edge, y from the top edge. */
        polygon: [number, number][];
        label: [number, number];
        /** About the drawing, not for the site (it is listed in docs/content-needed.md). */
        drawingNote?: string;
      }[];
    }[];
  }[];
}

const TYPE_OF_ROOMS: Apartment["type"][] = ["studio", "1-bedroom", "2-bedroom", "3-bedroom", "4-bedroom", "5-bedroom"];

/** "11", "11a", "12": by the number first, then the letter. */
export const byApartmentNumber = (a: string, b: string) => a.localeCompare(b, "mk", { numeric: true });

const capitalise = (word: string) => word.charAt(0).toLocaleUpperCase("mk") + word.slice(1);

export interface PlannedBuilding {
  number: number;
  id: string;
  name: string;
  floors: Floor[];
  apartments: Apartment[];
}

/**
 * Every apartment gets the drawing's number, area, number of rooms and room list as they are, its plan, and its outline
 * on its floor's sketch; every floor gets its own sketch. The status is not on the drawings: all are available until the
 * real availability arrives.
 */
export function buildFromPlans(
  plans: PlansFile,
  options: {
    projectId: string;
    /** The public folder the plan images were copied to, e.g. "/images/floorplans". */
    imageDir: string;
    buildingId: (number: number) => string;
    buildingName: (number: number) => string;
  }
): { buildings: PlannedBuilding[] } {
  const buildings = plans.buildings.map((plan): PlannedBuilding => {
    const id = options.buildingId(plan.building);
    const apartments: Apartment[] = [];
    const floors = [...plan.floors]
      .sort((a, b) => a.floor - b.floor)
      .map((floor): Floor => {
        const planned = [...floor.apartments]
          .sort((a, b) => byApartmentNumber(a.number, b.number))
          .map((a): Apartment => {
            const rooms: Room[] = a.spaces.map((space) => ({ name: space.name, area: space.area }));
            const outline: ApartmentOutline = { polygon: a.polygon, label: a.label };
            return {
              id: `${id}-f${floor.floor}-${unitSlug(a.number)}`,
              projectId: options.projectId,
              buildingId: id,
              floor: floor.floor,
              number: a.number,
              type: TYPE_OF_ROOMS[Math.min(a.rooms, 5)],
              typeLabel: capitalise(a.type),
              // "соби" as the drawing counts them, shown the way the site shows it everywhere
              bedrooms: a.rooms,
              bathrooms: a.spaces.filter((space) => space.name.startsWith("Бања")).length,
              area: a.area,
              areaDecimals: 2,
              balconyArea: a.spaces
                .filter((space) => /^(Тераса|Балкон)/.test(space.name))
                .reduce((sum, space) => sum + space.area, 0),
              status: "available",
              rooms,
              outline,
              gallery: [],
              planImage: {
                src: `${options.imageDir}/${a.plan}`,
                alt: `Основа на Стан ${a.number}`,
                isPlaceholder: false,
                transparent: true,
                width: a.planWidth,
                height: a.planHeight,
              },
            };
          });
        apartments.push(...planned);
        return {
          number: floor.floor,
          label: floor.name,
          apartmentIds: planned.map((a) => a.id),
          sketch: {
            src: `${options.imageDir}/${floor.sketch}`,
            alt: `Основа на ${floor.name} — ${options.buildingName(plan.building)}`,
            isPlaceholder: false,
            width: floor.sketchWidth,
            height: floor.sketchHeight,
          },
        };
      });
    return { number: plan.building, id, name: options.buildingName(plan.building), floors, apartments };
  });
  return { buildings };
}
