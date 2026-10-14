import type { Apartment, Building, ConstructionStage, Development, Orientation, Room, UnitStatus } from "@/types";
import { buildFromPlans, type PlansFile } from "./plans";
import cityCenterPlans from "./plans/city-center.json";
import { unitSlug } from "./slug";

// Pure, deterministic pseudo-random so server and client render identical mock data.
function seeded(...nums: number[]): number {
  const seed = nums.reduce((acc, n, i) => acc + n * (i * 37 + 101), 7);
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const ORIENTATIONS: Orientation[] = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

function generateRooms(bedrooms: number, area: number, balconyArea: number): Room[] {
  if (bedrooms === 0) {
    const living = Math.round(area * 0.55 * 10) / 10;
    const kitchen = Math.round(area * 0.18 * 10) / 10;
    const bathroom = Math.round(area * 0.11 * 10) / 10;
    const hallway = Math.round((area - living - kitchen - bathroom) * 10) / 10;
    return [
      { name: "Дневна и спална површина", area: living },
      { name: "Кујна", area: kitchen },
      { name: "Бања", area: bathroom },
      { name: "Ходник", area: Math.max(hallway, 2) },
      { name: "Тераса", area: balconyArea },
    ];
  }
  const living = Math.round(area * 0.29 * 10) / 10;
  const kitchen = Math.round(area * 0.11 * 10) / 10;
  const hallway = Math.round(area * 0.07 * 10) / 10;
  const bathroomCount = bedrooms >= 3 ? 2 : 1;
  const bathroomEach = Math.round(area * 0.052 * 10) / 10;
  const remaining = area - living - kitchen - hallway - bathroomEach * bathroomCount;
  const bedroomEach = Math.round((remaining / bedrooms) * 10) / 10;

  const rooms: Room[] = [
    { name: "Дневна соба", area: living },
    { name: "Кујна", area: kitchen },
  ];
  for (let i = 1; i <= bedrooms; i++) {
    rooms.push({ name: `Спална соба ${i}`, area: bedroomEach - (i - 1) * 0.6 });
  }
  for (let i = 1; i <= bathroomCount; i++) {
    rooms.push({ name: bathroomCount > 1 ? `Бања ${i}` : "Бања", area: bathroomEach });
  }
  rooms.push({ name: "Ходник", area: hallway });
  rooms.push({ name: "Тераса", area: balconyArea });
  return rooms;
}

function pickStatus(buildingIdx: number, floor: number, floorCount: number, idx: number): UnitStatus {
  // Lower floors and earlier buildings sell first — reads as a realistic, live sales curve.
  const soldBias = (1 - floor / floorCount) * 0.5 + (1 - buildingIdx / 6) * 0.15;
  const r = seeded(buildingIdx, floor, idx, 3);
  if (r < soldBias * 0.5) return "sold";
  if (r < soldBias * 0.5 + 0.2) return "reserved";
  return "available";
}

export interface GeneratedDevelopment {
  development: Development;
  apartments: Apartment[];
}

export function generateDevelopment(): GeneratedDevelopment {
  const allApartments: Apartment[] = [];
  const buildings: Building[] = [];

  const positions = [
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 2 },
    { row: 2, col: 0 },
    { row: 2, col: 2 },
    { row: 3, col: 1 },
  ];

  const buildingStatuses: Building["status"][] = [
    "interior",
    "interior",
    "exterior",
    "exterior",
    "structure",
    "foundation",
  ];

  // Real exterior renders supplied for the project, one per building.
  const buildingExteriors = [
    "/images/exteriors/exterior-01-dusk.jpg",
    "/images/exteriors/exterior-02-facade.jpg",
    "/images/exteriors/exterior-03-day.jpg",
    "/images/exteriors/exterior-04-lakeside.jpg",
    "/images/exteriors/exterior-05-object5.jpg",
    "/images/exteriors/exterior-06-billboard.jpg",
  ];

  // The six buildings come from the architect's plans (data/plans/city-center.json), floor by floor; nothing about their
  // floors or apartments is generated.
  const plans = buildFromPlans(cityCenterPlans as unknown as PlansFile, {
    projectId: "city-center",
    imageDir: "/images/floorplans",
    buildingId: (n) => `b${String(n).padStart(2, "0")}`,
    buildingName: (n) => `Зграда ${String(n).padStart(2, "0")}`,
  });
  for (const plan of plans.buildings) {
    const b = plan.number - 1;
    const label = String(plan.number).padStart(2, "0");
    allApartments.push(...plan.apartments);
    buildings.push({
      id: plan.id,
      name: plan.name,
      shortLabel: label,
      floors: plan.floors,
      totalApartments: plan.apartments.length,
      exteriorImage: { src: buildingExteriors[b], alt: `Зграда ${label} — надворешен изглед`, isPlaceholder: false },
      status: buildingStatuses[b],
      position: positions[b],
      // TODO(client): a short text about each building (docs/content-needed.md).
      description: `[Краток опис на зграда ${plan.number}: каква е, што има во приземјето, каков поглед имаат становите.]`,
    });
  }

  const constructionStages: ConstructionStage[] = [
    {
      key: "planning",
      label: "Планирање и проектирање",
      date: "Q1 2023",
      percentComplete: 100,
      description: "Завршени архитектонско проектирање, дозволи и инженерски одобренија.",
      image: { src: "", alt: "Фаза на планирање", isPlaceholder: true },
    },
    {
      key: "foundation",
      label: "Темели",
      date: "Q3 2023",
      percentComplete: 100,
      description: "Завршени ископ и темелни работи на сите шест згради.",
      image: { src: "", alt: "Фаза на темели", isPlaceholder: true },
    },
    {
      key: "structure",
      label: "Конструкција",
      date: "Q2 2024",
      percentComplete: 90,
      description: "Армирано-бетонската конструкција расте; Зградите 01–02 се веќе на кота карпи.",
      image: { src: "", alt: "Фаза на конструкција", isPlaceholder: true },
    },
    {
      key: "exterior",
      label: "Фасада",
      date: "Q1 2025",
      percentComplete: 60,
      description: "Фасадна обработка и застаклување во тек на првите три згради.",
      image: { src: "", alt: "Фаза на фасада", isPlaceholder: true },
    },
    {
      key: "interior",
      label: "Внатрешно доуредување",
      date: "Q4 2025",
      percentComplete: 25,
      description: "Инсталација на инсталации и внатрешно доуредување започнува во Зградите 01–02.",
      image: { src: "", alt: "Фаза на внатрешно доуредување", isPlaceholder: true },
    },
    {
      key: "completion",
      label: "Завршување и предавање",
      date: "Q2 2027",
      percentComplete: 0,
      description: "Финални инспекции, партерно уредување и предавање на клучеви на жителите.",
      image: { src: "", alt: "Фаза на завршување", isPlaceholder: true },
    },
  ];

  const development: Development = {
    id: "city-center",
    name: "City Center",
    location: "Струмица, Северна Македонија",
    description:
      "Станбен комплекс од шест згради, распоредени околу заеднички пејзажиран двор, кој ја комбинира современата архитектура со богат зелен простор во срцето на градот.",
    buildings,
    totalApartments: allApartments.length,
    expectedCompletion: "Q2 2027",
    constructionStages,
    heroImage: {
      src: "/images/site/masterplan-aerial.jpg",
      alt: "City Center — визуелизација од воздух",
      isPlaceholder: false,
    },
    nearbyPoints: [
      { name: "Автопат А4", category: "Транспорт", distance: "200 м" },
      { name: "Ул. Климент Охридски", category: "Транспорт", distance: "100 м" },
      { name: "Стадион Младост", category: "Спорт", distance: "450 м" },
      { name: "Спортска сала Парк", category: "Рекреација", distance: "500 м" },
      { name: "Бела Река", category: "Природа", distance: "650 м" },
      { name: "Макпетрол 051 Струмица 2", category: "Услуги", distance: "150 м" },
    ],
    mapQuery: "Ленинова, Струмица, Северна Македонија",
    masterplanImage: {
      src: "/images/site/masterplan-aerial.jpg",
      alt: "Ситуационен план — аерален поглед на комплексот",
      isPlaceholder: false,
    },
    // Best-effort marker centers over each building's rooftop in the real aerial
    // photo (percentages of the image, marker centered via translate). The photo
    // has no printed labels, so this mapping is a visual estimate calibrated
    // against the client's reference — adjust here if a number still looks off.
    buildingHotspots: {
      b01: { top: "46%", left: "21%" },
      b02: { top: "18%", left: "19%" },
      b03: { top: "28%", left: "49%" },
      b04: { top: "54%", left: "68%" },
      b05: { top: "78%", left: "84%" },
      b06: { top: "78%", left: "49%" },
    },
  };

  return { development, apartments: allApartments };
}

/** One apartment of a sample list: what is known about it. */
export interface SampleUnit {
  floor: number;
  number: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  orientation?: Orientation;
  planImage?: Apartment["planImage"];
}

const TYPE_OF_BEDROOMS: Apartment["type"][] = ["studio", "1-bedroom", "2-bedroom", "3-bedroom", "4-bedroom"];

/**
 * Sample apartments for a project that has none yet, made the same way as City Center's: the floors, numbers, areas and
 * rooms are what the project's data says, and the status and orientation (where not given) are the same deterministic
 * mock values. Every apartment is marked `sample`. `order` only varies the pseudo-random numbers between projects.
 */
export function buildSampleApartments(projectId: string, order: number, units: SampleUnit[]): Apartment[] {
  const floorCount = Math.max(1, ...units.map((u) => u.floor + 1));
  const perFloor = new Map<number, SampleUnit[]>();
  for (const u of units) perFloor.set(u.floor, [...(perFloor.get(u.floor) ?? []), u]);
  return units.map((u, idx) => {
    const balconyArea = Math.round((4 + seeded(order, u.floor, idx, 11) * 6) * 10) / 10;
    return {
      id: `${projectId}-f${u.floor}-${unitSlug(u.number)}`,
      projectId,
      sample: true,
      floor: u.floor,
      number: u.number,
      type: TYPE_OF_BEDROOMS[Math.min(u.bedrooms, 4)],
      bedrooms: u.bedrooms,
      bathrooms: u.bathrooms,
      area: u.area,
      balconyArea,
      orientation: u.orientation ?? ORIENTATIONS[Math.floor(seeded(order, u.floor, idx, 8) * ORIENTATIONS.length)],
      status: pickStatus(order, u.floor, floorCount, idx),
      rooms: generateRooms(u.bedrooms, u.area, balconyArea),
      gallery: [
        { src: "", alt: `${projectId} ${u.number} дневна соба`, isPlaceholder: true },
        { src: "", alt: `${projectId} ${u.number} кујна`, isPlaceholder: true },
        { src: "", alt: `${projectId} ${u.number} спална соба`, isPlaceholder: true },
      ],
      planImage: u.planImage,
    };
  });
}
