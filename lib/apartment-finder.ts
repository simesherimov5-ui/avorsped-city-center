import type { UnitStatus } from "@/types";

/** What the finder needs to know about one apartment. The page builds these from the project data. */
export type FinderApartment = {
  id: string;
  buildingId: string;
  floor: number;
  number: string;
  /** 0 is a studio. */
  bedrooms: number;
  area: number;
  status: UnitStatus;
  /** The apartment's own plan / render image (what its card has always shown). */
  plan: { src: string; alt: string; isPlaceholder: boolean };
};

/** A building that has apartments, drawn in the street: its floors (lowest first) and the apartments of each, in order. */
export type FinderBuilding = {
  id: string;
  name: string;
  project: string;
  floors: { number: number; label: string; apartmentIds: string[] }[];
};

export type FloorChoice = "all" | "g" | "m" | "h";
export type AreaChoice = "all" | "a" | "b" | "c" | "d";
export type View = "grid" | "list";

export type Choices = {
  /** A building id, or "all". */
  building: string;
  /** The number of bedrooms (0 = studio), or "all". */
  rooms: number | "all";
  floor: FloorChoice;
  area: AreaChoice;
  free: boolean;
  view: View;
};

export const NO_CHOICES: Choices = {
  building: "all",
  rooms: "all",
  floor: "all",
  area: "all",
  free: false,
  view: "grid",
};

export const FLOOR_LABELS: Record<FloorChoice, string> = {
  all: "Сите катови",
  g: "Приземје",
  m: "Кат 1 и 2",
  h: "Кат 3 и погоре",
};
export const AREA_LABELS: Record<AreaChoice, string> = {
  all: "Сите површини",
  a: "до 50 m²",
  b: "50 – 80 m²",
  c: "80 – 110 m²",
  d: "над 110 m²",
};

const FLOOR_TEST: Record<FloorChoice, (floor: number) => boolean> = {
  all: () => true,
  g: (f) => f === 0,
  m: (f) => f >= 1 && f <= 2,
  h: (f) => f >= 3,
};
const AREA_TEST: Record<AreaChoice, (area: number) => boolean> = {
  all: () => true,
  a: (x) => x < 50,
  b: (x) => x >= 50 && x < 80,
  c: (x) => x >= 80 && x < 110,
  d: (x) => x >= 110,
};

/** The apartments for a set of choices, in the order of the page: building, floor, apartment number. */
export function filterApartments(list: FinderApartment[], choices: Choices): FinderApartment[] {
  return list.filter(
    (a) =>
      (choices.building === "all" || a.buildingId === choices.building) &&
      (choices.rooms === "all" || a.bedrooms === choices.rooms) &&
      FLOOR_TEST[choices.floor](a.floor) &&
      AREA_TEST[choices.area](a.area) &&
      (!choices.free || a.status === "available")
  );
}

/** The apartments in the order of the page: the order of the buildings, then floor, then apartment number. */
export function sortForPage(list: FinderApartment[], buildingOrder: string[]): FinderApartment[] {
  return [...list].sort(
    (a, b) =>
      buildingOrder.indexOf(a.buildingId) - buildingOrder.indexOf(b.buildingId) ||
      a.floor - b.floor ||
      a.number.localeCompare(b.number, "mk", { numeric: true })
  );
}

/** Only the options some apartment falls into are offered. */
export function floorOptions(list: FinderApartment[]): FloorChoice[] {
  return (["g", "m", "h"] as const).filter((key) => list.some((a) => FLOOR_TEST[key](a.floor)));
}
export function areaOptions(list: FinderApartment[]): AreaChoice[] {
  return (["a", "b", "c", "d"] as const).filter((key) => list.some((a) => AREA_TEST[key](a.area)));
}
export function roomOptions(list: FinderApartment[]): number[] {
  return [...new Set(list.map((a) => a.bedrooms))].sort((a, b) => a - b);
}

export const roomLabel = (rooms: number) => (rooms === 0 ? "Студио" : rooms === 1 ? "1 соба" : `${rooms} соби`);

/** A fixed number between 0 and 1 for an id, the same on the server and in the browser (it staggers the windows lighting up). */
export function seedFor(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** "Прикажани 8 од 156 станови" · "Прикажан 1 стан" · "Нема станови за овој избор". */
export function countLine(shown: number, total: number): string {
  if (total === 0) return "Нема станови за овој избор";
  if (total === 1) return "Прикажан 1 стан";
  return `Прикажани ${shown} од ${total} станови`;
}

// ---- the address: ?building=&rooms=&floor=&area=&free=1&view=list&apartment=

type Params = { get(name: string): string | null };

/** Reads the choices (and the open apartment) from an address. A value that means nothing here is ignored. */
export function parseChoices(
  params: Params,
  list: FinderApartment[],
  buildingIds: string[]
): { choices: Choices; apartment: string | null } {
  const building = params.get("building");
  const rooms = params.get("rooms");
  const floor = params.get("floor");
  const area = params.get("area");
  const apartment = params.get("apartment");
  const roomNumber = rooms !== null && rooms !== "" && !Number.isNaN(Number(rooms)) ? Number(rooms) : null;
  return {
    choices: {
      building: building && buildingIds.includes(building) ? building : "all",
      rooms: roomNumber !== null && list.some((a) => a.bedrooms === roomNumber) ? roomNumber : "all",
      floor: floor === "g" || floor === "m" || floor === "h" ? floor : "all",
      area: area === "a" || area === "b" || area === "c" || area === "d" ? area : "all",
      free: params.get("free") === "1",
      view: params.get("view") === "list" ? "list" : "grid",
    },
    apartment: apartment && list.some((a) => a.id === apartment) ? apartment : null,
  };
}

/** The address for the choices: "" when nothing is chosen, otherwise "?building=b02&…". */
export function choicesQuery(choices: Choices, apartment: string | null = null): string {
  const query = new URLSearchParams();
  if (choices.building !== "all") query.set("building", choices.building);
  if (choices.rooms !== "all") query.set("rooms", String(choices.rooms));
  if (choices.floor !== "all") query.set("floor", choices.floor);
  if (choices.area !== "all") query.set("area", choices.area);
  if (choices.free) query.set("free", "1");
  if (choices.view === "list") query.set("view", "list");
  if (apartment) query.set("apartment", apartment);
  const text = query.toString();
  return text ? `?${text}` : "";
}

// ---- the street: how wide it is, in units of u (a window's width)

const WINDOW_GAP = 0.5;
const BODY_SIDES = 0.85;
const BUILDING_GAP = 3;
const GROUP_GAP = 5;

/** The widest floor of a building, in windows. */
export const widestFloor = (building: FinderBuilding) =>
  Math.max(1, ...building.floors.map((f) => f.apartmentIds.length));

/** The width of a building's body in u: its widest floor of windows, the gaps between them and the sides. */
export const bodyUnits = (building: FinderBuilding) =>
  widestFloor(building) + (widestFloor(building) - 1) * WINDOW_GAP + 2 * BODY_SIDES;

/**
 * How many u the whole street is wide (every body, the gaps between buildings and between project groups, the
 * overhang of the first and last base bar), and how many fixed pixels the borders add. The page divides the content
 * width by this to get u (7px at least, 14px at most).
 */
export function streetUnits(buildings: FinderBuilding[]): { units: number; pixels: number } {
  const groups = new Map<string, FinderBuilding[]>();
  for (const b of buildings) groups.set(b.project, [...(groups.get(b.project) ?? []), b]);
  let units = 1.5 + 1.3;
  for (const group of groups.values()) {
    units += group.reduce((sum, b) => sum + bodyUnits(b), 0) + (group.length - 1) * BUILDING_GAP;
  }
  units += (groups.size - 1) * GROUP_GAP;
  return { units: Math.ceil(units * 10) / 10 + 0.5, pixels: buildings.length * 2 };
}
