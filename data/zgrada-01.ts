import type { Apartment, Building, Floor, FloorSketch, Room } from "@/types";

// Зграда 01 of City Center = «Ламела 1» in the architect's drawings (javor-sped-complete/reference/lamela-1/): the first
// building with real data. Six levels of five apartments, 30 in all; the same floor plan and the same five apartment
// types on every level. Every number below is from the architect's drawing; what the drawing does not say is left out
// (no orientation, no facts of any kind that are not written there).

const DIR = "/images/floorplans/b01";

/** The floors, bottom to top: Кат 1 … Кат 5 and Поткровје. This building has no ground-floor apartments. */
const LEVELS: { number: number; label: string }[] = [
  { number: 1, label: "Кат 1" },
  { number: 2, label: "Кат 2" },
  { number: 3, label: "Кат 3" },
  { number: 4, label: "Кат 4" },
  { number: 5, label: "Кат 5" },
  { number: 6, label: "Поткровје" },
];

/** The five apartments of a level, left to right as the drawing numbers them: position 1 is top left, 5 top right. */
const TYPE_AT_POSITION = ["A", "B", "C", "D", "E"] as const;
type TypeCode = (typeof TYPE_AT_POSITION)[number];

const ROOMS_A: Room[] = [
  { name: "Ходник", area: 6.8 },
  { name: "Дневна, кујна со трпезарија", area: 45 },
  { name: "Спална соба", area: 14 },
  { name: "Детска соба", area: 12.5 },
  { name: "Бања", area: 5.35 },
  { name: "Тоалет", area: 2.8 },
  { name: "Тераса", area: 7.6 },
];
const ROOMS_B: Room[] = [
  { name: "Ходник", area: 9 },
  { name: "Дневна, кујна со трпезарија", area: 34.15 },
  { name: "Спална соба", area: 14.1 },
  { name: "Детска соба", area: 16.25 },
  { name: "Бања", area: 5 },
  { name: "Остава", area: 1 },
  { name: "Тоалет", area: 2 },
  { name: "Тераса", area: 7.6 },
];
const ROOMS_C: Room[] = [
  { name: "Ходник", area: 7.4 },
  { name: "Дневна, кујна со трпезарија", area: 27.75 },
  { name: "Тоалет", area: 2.75 },
  { name: "Детска соба", area: 11.2 },
  { name: "Спална соба", area: 16.15 },
  { name: "Бања", area: 5.1 },
  { name: "Тераса", area: 8.9 },
];

/** The five types. A to D are 3 соби, E is 4 соби. D is B's mirror image; E's table is A's (the drawing has no other). */
const TYPES: Record<TypeCode, { area: number; rooms: number; list: Room[] }> = {
  A: { area: 94.05, rooms: 3, list: ROOMS_A },
  B: { area: 89.1, rooms: 3, list: ROOMS_B },
  C: { area: 79.25, rooms: 3, list: ROOMS_C },
  D: { area: 89.1, rooms: 3, list: ROOMS_B },
  E: { area: 94.05, rooms: 4, list: ROOMS_A },
};

/**
 * The floor sketch (the same for every level) and where each apartment sits on it. Values are percent of the image: x
 * from the left edge, y from the top edge. Each apartment's polygon includes its balcony; the label is where its number
 * is shown. From lamela-1-hotspots.json.
 */
const FLOOR_SKETCH: FloorSketch = {
  image: { src: `${DIR}/kat.webp`, alt: "Основа на кат — Зграда 01", isPlaceholder: false, width: 3200, height: 1872 },
  shapes: [
    {
      position: 1,
      label: [20.58, 27.3],
      polygon: [
        [21.7, 11.27],
        [21.7, 1.45],
        [9.36, 1.45],
        [9.36, 11.27],
        [1.71, 11.27],
        [1.71, 49.42],
        [28.79, 49.42],
        [28.79, 40.35],
        [42.67, 40.35],
        [42.67, 11.27],
      ],
    },
    {
      position: 2,
      label: [18.69, 70.03],
      polygon: [
        [1.74, 88.77],
        [9.38, 88.77],
        [9.38, 98.59],
        [21.71, 98.59],
        [21.71, 88.77],
        [33.71, 88.77],
        [33.71, 60.75],
        [41.01, 60.75],
        [41.01, 48.88],
        [1.74, 48.88],
      ],
    },
    {
      position: 3,
      label: [49.03, 73.24],
      polygon: [
        [33.3, 60.03],
        [33.3, 98.34],
        [47.14, 98.34],
        [47.14, 88.64],
        [66.67, 88.64],
        [66.67, 60.03],
        [59.03, 60.03],
        [59.03, 48.72],
        [40.94, 48.72],
        [40.94, 60.03],
      ],
    },
    {
      position: 4,
      label: [81.34, 69.37],
      polygon: [
        [59.06, 48.22],
        [59.06, 59.97],
        [66.3, 59.97],
        [66.3, 88.14],
        [78.31, 88.14],
        [78.31, 97.84],
        [90.64, 97.84],
        [90.64, 88.14],
        [98.29, 88.14],
        [98.29, 48.22],
      ],
    },
    {
      position: 5,
      label: [79.41, 27.3],
      polygon: [
        [57.33, 11.27],
        [57.33, 40.35],
        [71.22, 40.35],
        [71.22, 49.42],
        [98.29, 49.42],
        [98.29, 11.27],
        [90.64, 11.27],
        [90.64, 1.45],
        [78.31, 1.45],
        [78.31, 11.27],
      ],
    },
  ],
};

/** Зграда 01's real floors and apartments. The status of each apartment is not known yet: all are available. */
export function buildZgrada01(): { floors: Floor[]; apartments: Apartment[]; floorSketch: Building["floorSketch"] } {
  const apartments: Apartment[] = [];
  const floors: Floor[] = [];
  let number = 0;
  for (const level of LEVELS) {
    const ids: string[] = [];
    TYPE_AT_POSITION.forEach((code, i) => {
      number += 1;
      const type = TYPES[code];
      const id = `b01-f${level.number}-${number}`;
      const balcony = type.list.find((r) => r.name === "Тераса")?.area ?? 0;
      apartments.push({
        id,
        projectId: "city-center",
        buildingId: "b01",
        floor: level.number,
        number: String(number),
        position: i + 1,
        planType: code,
        type: type.rooms === 4 ? "4-bedroom" : "3-bedroom",
        // "соби" as the drawing counts them (the living room included), the way the site shows it everywhere
        bedrooms: type.rooms,
        bathrooms: 1,
        area: type.area,
        areaDecimals: 2,
        balconyArea: balcony,
        status: "available",
        rooms: type.list,
        gallery: [],
        planImage: {
          src: `${DIR}/tip-${code.toLowerCase()}.webp`,
          alt: `Основа на Стан ${number}, тип ${code}`,
          isPlaceholder: false,
          transparent: true,
        },
      });
      ids.push(id);
    });
    floors.push({ number: level.number, label: level.label, apartmentIds: ids });
  }
  return { floors, apartments, floorSketch: FLOOR_SKETCH };
}
