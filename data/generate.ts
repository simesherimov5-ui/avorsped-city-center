import type {
  Apartment,
  Building,
  ConstructionStage,
  Development,
  Floor,
  Orientation,
  Room,
  UnitStatus,
} from "@/types";

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

const UNIT_TYPES: { type: Apartment["type"]; bedrooms: number; bathrooms: number; area: number }[] = [
  { type: "studio", bedrooms: 0, bathrooms: 1, area: 42 },
  { type: "1-bedroom", bedrooms: 1, bathrooms: 1, area: 55 },
  { type: "1-bedroom", bedrooms: 1, bathrooms: 1, area: 62 },
  { type: "2-bedroom", bedrooms: 2, bathrooms: 1, area: 74 },
  { type: "2-bedroom", bedrooms: 2, bathrooms: 2, area: 82 },
  { type: "3-bedroom", bedrooms: 3, bathrooms: 2, area: 91 },
  { type: "3-bedroom", bedrooms: 3, bathrooms: 2, area: 105 },
  { type: "4-bedroom", bedrooms: 4, bathrooms: 3, area: 120 },
];

const BASE_RATE_EUR_PER_SQM = 2150;

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

  const rooms: Room[] = [{ name: "Дневна соба", area: living }, { name: "Кујна", area: kitchen }];
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

function buildFloorPlanShape(index: number, count: number): Apartment["shape"] {
  const gutter = 2;
  const width = 100 / count;
  const x0 = index * width + gutter / 2;
  const x1 = (index + 1) * width - gutter / 2;
  return {
    points: [
      [x0, 6],
      [x1, 6],
      [x1, 94],
      [x0, 94],
    ],
    labelPosition: [(x0 + x1) / 2, 50],
  };
}

// Real architectural data supplied for Building 06, Floor 3 (Објект 6, Кат 03) —
// every other floor in the development is still procedurally generated mock data.
interface RealUnitDef {
  number: string;
  bedrooms: number;
  bathrooms: number;
  balconyArea: number;
  rooms: Room[];
}

const REAL_B06_F3_UNITS: RealUnitDef[] = [
  {
    number: "21",
    bedrooms: 2,
    bathrooms: 1,
    balconyArea: 5.25,
    rooms: [
      { name: "Ходник", area: 11.35 },
      { name: "Дневна престој, кујна со трпезарија", area: 25.65 },
      { name: "Спална соба", area: 13.05 },
      { name: "Детска соба", area: 11.2 },
      { name: "Бања", area: 4.95 },
      { name: "Тераса", area: 5.25 },
    ],
  },
  {
    number: "21а",
    bedrooms: 1,
    bathrooms: 1,
    balconyArea: 5.45,
    rooms: [
      { name: "Ходник", area: 3.9 },
      { name: "Дневна престој, кујна со трпезарија", area: 27.67 },
      { name: "Спална соба", area: 11.4 },
      { name: "Бања", area: 4.4 },
      { name: "Тераса", area: 5.45 },
    ],
  },
  {
    number: "22",
    bedrooms: 2,
    bathrooms: 1,
    balconyArea: 5.88,
    rooms: [
      { name: "Ходник", area: 9.43 },
      { name: "Дневна престој, кујна со трпезарија", area: 38.92 },
      { name: "Спална соба", area: 17.44 },
      { name: "Детска соба", area: 11.84 },
      { name: "Бања", area: 4.5 },
      { name: "Тоалет", area: 2.4 },
      { name: "Тераса", area: 5.88 },
    ],
  },
  {
    number: "23",
    bedrooms: 2,
    bathrooms: 1,
    balconyArea: 5.88,
    rooms: [
      { name: "Ходник", area: 7.4 },
      { name: "Дневна престој, кујна со трпезарија", area: 39.36 },
      { name: "Спална соба", area: 20.96 },
      { name: "Детска соба", area: 11.84 },
      { name: "Бања", area: 6.0 },
      { name: "Тоалет", area: 2.4 },
      { name: "Тераса", area: 5.88 },
    ],
  },
  {
    number: "24",
    bedrooms: 2,
    bathrooms: 2,
    balconyArea: 6.2,
    rooms: [
      { name: "Ходник", area: 11.4 },
      { name: "Дневна престој, кујна со трпезарија", area: 33.23 },
      { name: "Спална соба", area: 17.22 },
      { name: "Детска соба", area: 14.02 },
      { name: "Бања 1", area: 4.5 },
      { name: "Бања 2", area: 7.52 },
      { name: "Тераса", area: 6.2 },
    ],
  },
  {
    number: "25",
    bedrooms: 2,
    bathrooms: 1,
    balconyArea: 5.25,
    rooms: [
      { name: "Ходник", area: 7.52 },
      { name: "Дневна престој, кујна со трпезарија", area: 34.0 },
      { name: "Спална соба", area: 13.23 },
      { name: "Детска соба", area: 10.3 },
      { name: "Бања", area: 4.1 },
      { name: "Тоалет", area: 2.4 },
      { name: "Тераса", area: 5.25 },
    ],
  },
  {
    number: "26",
    bedrooms: 1,
    bathrooms: 1,
    balconyArea: 5.04,
    rooms: [
      { name: "Ходник", area: 9.29 },
      { name: "Дневна престој, кујна со трпезарија", area: 22.02 },
      { name: "Спална соба", area: 14.79 },
      { name: "Бања", area: 6.08 },
      { name: "Тераса", area: 5.04 },
    ],
  },
  {
    number: "27",
    bedrooms: 2,
    bathrooms: 1,
    balconyArea: 5.88,
    rooms: [
      { name: "Ходник", area: 7.6 },
      { name: "Дневна престој, кујна со трпезарија", area: 39.54 },
      { name: "Спална соба", area: 20.57 },
      { name: "Детска соба", area: 11.84 },
      { name: "Бања", area: 6.19 },
      { name: "Тоалет", area: 2.52 },
      { name: "Тераса", area: 5.88 },
    ],
  },
  {
    number: "28",
    bedrooms: 2,
    bathrooms: 1,
    balconyArea: 6.19,
    rooms: [
      { name: "Ходник", area: 6.48 },
      { name: "Дневна престој, кујна со трпезарија", area: 38.04 },
      { name: "Спална соба", area: 21.74 },
      { name: "Детска соба", area: 11.9 },
      { name: "Бања", area: 5.6 },
      { name: "Тоалет", area: 2.52 },
      { name: "Тераса", area: 6.19 },
    ],
  },
  {
    number: "29",
    bedrooms: 1,
    bathrooms: 1,
    balconyArea: 5.04,
    rooms: [
      { name: "Ходник", area: 9.29 },
      { name: "Дневна престој, кујна со трпезарија", area: 22.02 },
      { name: "Спална соба", area: 14.79 },
      { name: "Бања", area: 6.08 },
      { name: "Тераса", area: 5.04 },
    ],
  },
  {
    number: "30",
    bedrooms: 2,
    bathrooms: 1,
    balconyArea: 5.25,
    rooms: [
      { name: "Ходник", area: 9.37 },
      { name: "Дневна престој, кујна со трпезарија", area: 33.6 },
      { name: "Спална соба", area: 11.85 },
      { name: "Детска соба", area: 10.35 },
      { name: "Бања", area: 4.11 },
      { name: "Тоалет", area: 2.6 },
      { name: "Тераса", area: 5.25 },
    ],
  },
];

function buildRealB06F3Apartments(buildingId: string, floor: number): Apartment[] {
  return REAL_B06_F3_UNITS.map((unit, idx) => {
    const area = Math.round(unit.rooms.reduce((sum, r) => sum + r.area, 0) * 100) / 100;
    const orientation = ORIENTATIONS[Math.floor(seeded(5, floor, idx, 8) * ORIENTATIONS.length)];
    const orientationPremium = orientation.includes("South") ? 1.04 : 1;
    const price =
      Math.round((area * BASE_RATE_EUR_PER_SQM * (1 + floor * 0.006) * orientationPremium) / 500) * 500;
    const id = `${buildingId}-f${floor}-${unit.number}`;

    return {
      id,
      buildingId,
      floor,
      number: unit.number,
      type: unit.bedrooms === 1 ? "1-bedroom" : "2-bedroom",
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      area,
      balconyArea: unit.balconyArea,
      orientation,
      price,
      status: pickStatus(5, floor, 8, idx),
      rooms: unit.rooms,
      shape: buildFloorPlanShape(idx, REAL_B06_F3_UNITS.length),
      gallery: [
        { src: "", alt: `${id} дневна соба`, isPlaceholder: true },
        { src: "", alt: `${id} кујна`, isPlaceholder: true },
        { src: "", alt: `${id} спална соба`, isPlaceholder: true },
      ],
      tour: { available: false, type: "none" },
    };
  });
}

function buildingApartmentsPerFloor(buildingIdx: number, floor: number): number {
  if (floor === 0) return 2; // ground floor: lobby + fewer, larger units
  return 3 + Math.floor(seeded(buildingIdx, floor, 1) * 3); // 3-5
}

function floorCountForBuilding(buildingIdx: number): number {
  return 5 + Math.floor(seeded(buildingIdx, 99) * 4); // 5-8
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

  for (let b = 0; b < 6; b++) {
    const buildingId = `b${String(b + 1).padStart(2, "0")}`;
    const floorCount = floorCountForBuilding(b);
    const floors: Floor[] = [];

    for (let f = 0; f <= floorCount; f++) {
      if (buildingId === "b06" && f === 3) {
        // Real architectural data for this floor — see REAL_B06_F3_UNITS.
        const realApartments = buildRealB06F3Apartments(buildingId, f);
        allApartments.push(...realApartments);
        floors.push({
          number: f,
          label: `Кат ${f}`,
          apartmentIds: realApartments.map((a) => a.id),
        });
        continue;
      }

      const apCount = buildingApartmentsPerFloor(b, f);
      const apartmentIds: string[] = [];

      for (let a = 0; a < apCount; a++) {
        const unitTypeIdx = Math.floor(seeded(b, f, a, 5) * UNIT_TYPES.length);
        const unitType = UNIT_TYPES[unitTypeIdx];
        const orientation = ORIENTATIONS[Math.floor(seeded(b, f, a, 8) * ORIENTATIONS.length)];
        const balconyArea = Math.round((6 + seeded(b, f, a, 11) * 10) * 10) / 10;
        const number = `${f}${String(a + 1).padStart(2, "0")}`;
        const id = `${buildingId}-f${f}-${number}`;
        const floorPremium = 1 + f * 0.006;
        const orientationPremium = orientation.includes("South") ? 1.04 : 1;
        const price = Math.round(
          (unitType.area * BASE_RATE_EUR_PER_SQM * floorPremium * orientationPremium) / 500
        ) * 500;

        const apartment: Apartment = {
          id,
          buildingId,
          floor: f,
          number,
          type: unitType.type,
          bedrooms: unitType.bedrooms,
          bathrooms: unitType.bathrooms,
          area: unitType.area,
          balconyArea,
          orientation,
          price,
          status: pickStatus(b, f, floorCount, a),
          rooms: generateRooms(unitType.bedrooms, unitType.area, balconyArea),
          shape: buildFloorPlanShape(a, apCount),
          gallery: [
            { src: "", alt: `${id} дневна соба`, isPlaceholder: true },
            { src: "", alt: `${id} кујна`, isPlaceholder: true },
            { src: "", alt: `${id} спална соба`, isPlaceholder: true },
          ],
          tour: { available: false, type: "none" },
        };

        allApartments.push(apartment);
        apartmentIds.push(id);
      }

      floors.push({
        number: f,
        label: f === 0 ? "Приземје" : `Кат ${f}`,
        apartmentIds,
      });
    }

    buildings.push({
      id: buildingId,
      name: `Зграда ${String(b + 1).padStart(2, "0")}`,
      shortLabel: String(b + 1).padStart(2, "0"),
      floors,
      totalApartments: floors.reduce((sum, fl) => sum + fl.apartmentIds.length, 0),
      exteriorImage: {
        src: buildingExteriors[b],
        alt: `Зграда ${String(b + 1).padStart(2, "0")} - надворешен изглед`,
        isPlaceholder: false,
      },
      status: buildingStatuses[b],
      position: positions[b],
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
      "Станбен комплекс од шест згради, распоредени околу заеднички пејзажиран двор, кој ја комбинира современата архитектура со богат зеленчина простор во срцето на градот.",
    buildings,
    totalApartments: allApartments.length,
    expectedCompletion: "Q2 2027",
    constructionStages,
    heroImage: {
      src: "/images/site/masterplan-aerial.jpg",
      alt: "City Center - визуелизација од воздух",
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
  };

  return { development, apartments: allApartments };
}
