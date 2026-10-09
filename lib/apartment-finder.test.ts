import { describe, expect, it } from "vitest";
import {
  NO_CHOICES,
  areaOptions,
  choicesQuery,
  countLine,
  filterApartments,
  floorOptions,
  parseChoices,
  roomOptions,
  seedFor,
  sortForPage,
  streetUnits,
  type FinderApartment,
  type FinderBuilding,
} from "./apartment-finder";

const plan = { src: "/x.jpg", alt: "", isPlaceholder: false };
const apt = (
  id: string,
  buildingId: string,
  floor: number,
  number: string,
  bedrooms: number,
  area: number,
  status: FinderApartment["status"]
): FinderApartment => ({
  id,
  projectId: "p",
  buildingId,
  floor,
  number,
  bedrooms,
  area,
  status,
  plan,
});
const LIST = [
  apt("b02-f3-301", "b02", 3, "301", 2, 85, "available"),
  apt("b01-f0-001", "b01", 0, "001", 0, 34, "sold"),
  apt("b01-f1-102", "b01", 1, "102", 1, 52, "reserved"),
  apt("b01-f1-101", "b01", 1, "101", 3, 120, "available"),
];

describe("filterApartments", () => {
  it("keeps everything with no choices", () => {
    expect(filterApartments(LIST, NO_CHOICES)).toHaveLength(4);
  });
  it("filters by building, rooms, floor, area and availability together", () => {
    expect(filterApartments(LIST, { ...NO_CHOICES, building: "b01" }).map((a) => a.id)).toEqual([
      "b01-f0-001",
      "b01-f1-102",
      "b01-f1-101",
    ]);
    expect(filterApartments(LIST, { ...NO_CHOICES, rooms: 0 }).map((a) => a.id)).toEqual(["b01-f0-001"]);
    expect(filterApartments(LIST, { ...NO_CHOICES, floor: "m" }).map((a) => a.id)).toEqual([
      "b01-f1-102",
      "b01-f1-101",
    ]);
    expect(filterApartments(LIST, { ...NO_CHOICES, floor: "h" }).map((a) => a.id)).toEqual(["b02-f3-301"]);
    expect(filterApartments(LIST, { ...NO_CHOICES, area: "b" }).map((a) => a.id)).toEqual(["b01-f1-102"]);
    expect(filterApartments(LIST, { ...NO_CHOICES, area: "d" }).map((a) => a.id)).toEqual(["b01-f1-101"]);
    expect(filterApartments(LIST, { ...NO_CHOICES, free: true, building: "b01" }).map((a) => a.id)).toEqual([
      "b01-f1-101",
    ]);
  });
  it("puts the edges of the area bands in the upper band", () => {
    const edge = [
      apt("a", "b", 1, "1", 1, 50, "available"),
      apt("b", "b", 1, "2", 1, 80, "available"),
      apt("c", "b", 1, "3", 1, 110, "available"),
    ];
    expect(filterApartments(edge, { ...NO_CHOICES, area: "b" }).map((a) => a.id)).toEqual(["a"]);
    expect(filterApartments(edge, { ...NO_CHOICES, area: "c" }).map((a) => a.id)).toEqual(["b"]);
    expect(filterApartments(edge, { ...NO_CHOICES, area: "d" }).map((a) => a.id)).toEqual(["c"]);
  });
});

describe("options", () => {
  it("offers only what some apartment falls into", () => {
    const only = [apt("a", "b", 1, "1", 2, 60, "available")];
    expect(floorOptions(only)).toEqual(["m"]);
    expect(areaOptions(only)).toEqual(["b"]);
    expect(roomOptions(LIST)).toEqual([0, 1, 2, 3]);
  });
});

describe("sortForPage", () => {
  it("orders by building, floor, apartment number", () => {
    expect(sortForPage(LIST, ["b01", "b02"]).map((a) => a.id)).toEqual([
      "b01-f0-001",
      "b01-f1-101",
      "b01-f1-102",
      "b02-f3-301",
    ]);
  });
});

describe("the address", () => {
  const ids = ["b01", "b02"];
  const read = (query: string) => parseChoices(new URLSearchParams(query), LIST, ids);
  it("round-trips the choices and the open apartment", () => {
    const choices = {
      building: "b01",
      rooms: 3,
      floor: "m" as const,
      area: "d" as const,
      free: true,
      view: "list" as const,
    };
    const query = choicesQuery(choices, "b01-f1-101");
    expect(read(query)).toEqual({ choices, apartment: "b01-f1-101" });
  });
  it("is empty when nothing is chosen", () => {
    expect(choicesQuery(NO_CHOICES)).toBe("");
  });
  it("ignores values that mean nothing, including the old price and sort parameters", () => {
    const parsed = read("building=nope&rooms=9&floor=x&area=z&maxPrice=100000&sort=price-asc&apartment=zzz");
    expect(parsed).toEqual({ choices: NO_CHOICES, apartment: null });
  });
});

describe("misc", () => {
  it("gives the same seed for the same id, between 0 and 1", () => {
    expect(seedFor("b01-f1-101")).toBe(seedFor("b01-f1-101"));
    expect(seedFor("b01-f1-101")).toBeGreaterThanOrEqual(0);
    expect(seedFor("b01-f1-101")).toBeLessThan(1);
  });
  it("words the count line", () => {
    expect(countLine(8, 156)).toBe("Прикажани 8 од 156 станови");
    expect(countLine(1, 1)).toBe("Прикажан 1 стан");
    expect(countLine(0, 0)).toBe("Нема станови за овој избор");
  });
  it("measures the street from the windows, the gaps and the groups", () => {
    const b = (id: string, project: string, per: number): FinderBuilding => ({
      id,
      name: id,
      project,
      projectId: project,
      projectHref: `/projects/${project}`,
      coming: per === 0,
      floors:
        per === 0 ? [] : [{ number: 0, label: "", apartmentIds: Array.from({ length: per }, (_, i) => `${id}-${i}`) }],
    });
    const one = streetUnits([b("a", "P", 4)]);
    const two = streetUnits([b("a", "P", 4), b("b", "P", 4)]);
    const split = streetUnits([b("a", "P", 4), b("b", "Q", 4)]);
    expect(two.units).toBeGreaterThan(one.units);
    expect(split.units).toBeGreaterThan(two.units);
    expect(two.pixels).toBe(4);
    // a project with no apartments yet is still a building on the street, as an empty outline
    expect(streetUnits([b("a", "P", 4), b("c", "R", 0)]).units).toBeGreaterThan(one.units);
    expect(streetUnits([b("c", "R", 0)]).height).toBeGreaterThan(5);
  });
});
