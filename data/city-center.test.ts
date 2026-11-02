import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { formatAreaRange } from "@/lib/format";
import { apartments, buildings, getApartment, getBuilding, projects } from "@/data";

// City Center's six buildings, from the architect's plans (data/plans/city-center.json): the apartments, floors,
// sketches and plans are real; the status of each apartment is not known yet (all available).
const of = (building: string) => apartments.filter((a) => a.buildingId === building);
const find = (building: string, number: string) => of(building).find((a) => a.number === number)!;
const at = (building: string, floor: number) =>
  of(building)
    .filter((a) => a.floor === floor)
    .map((a) => a.number);

describe("City Center's plans", () => {
  it("has the number of apartments the drawings give, 207 in all, and no sample ones", () => {
    expect(buildings.map((b) => of(b.id).length)).toEqual([30, 30, 35, 23, 24, 65]);
    expect(apartments.filter((a) => a.projectId === "city-center")).toHaveLength(207);
    expect(buildings.map((b) => b.totalApartments)).toEqual([30, 30, 35, 23, 24, 65]);
    expect(apartments.every((a) => a.projectId !== "city-center" || a.sample === undefined)).toBe(true);
  });

  it("has six floors in every building, 01 to 05 and ПК for the attic, and none on the ground floor", () => {
    for (const b of buildings) {
      expect(b.floors.map((f) => f.label)).toEqual(["01", "02", "03", "04", "05", "ПК"]);
      expect(b.floors.some((f) => f.number === 0)).toBe(false);
    }
  });

  it("keeps the drawing's numbers as text, sorted after their number, with their gaps", () => {
    expect(at("b06", 1)).toHaveLength(10);
    expect(at("b06", 2)).toHaveLength(11);
    expect(at("b06", 2)).toEqual(["11", "11a", "12", "13", "14", "15", "16", "17", "18", "19", "20"]);
    expect(of("b03").some((a) => a.number === "6")).toBe(false);
    expect(at("b03", 2)).toEqual(["7", "8", "9", "10", "11", "12"]);
    expect(at("b04", 1)).toEqual(["1", "2", "3"]);
    expect(at("b04", 3)).toEqual(["8", "9", "10", "11"]);
    expect(at("b04", 6)).toEqual(["20", "21", "22", "23"]);
  });

  it("has the spot-checked areas, rooms and floors", () => {
    const check = (b: string, n: string, area: number, rooms: number, floor: string) => {
      const a = find(b, n);
      expect(
        [a.area, a.bedrooms, getBuilding(b)!.floors.find((f) => f.number === a.floor)!.label],
        `${b} ${n}`
      ).toEqual([area, rooms, floor]);
    };
    check("b01", "1", 186.9, 4, "01");
    check("b01", "6", 94.05, 3, "02");
    check("b01", "30", 94.05, 3, "ПК");
    check("b02", "4", 119.2, 3, "01");
    check("b02", "5", 209.7, 4, "01");
    check("b03", "12", 42.2, 2, "02");
    check("b03", "36", 42.2, 2, "ПК");
    check("b04", "1", 117.26, 3, "01");
    check("b04", "2", 133.07, 3, "01");
    check("b04", "3", 208.59, 4, "01");
    check("b05", "3", 28.7, 1, "01");
    check("b05", "8", 186.9, 5, "02");
    check("b05", "10", 81, 3, "03");
    check("b06", "11a", 52.82, 2, "02");
    check("b06", "33", 115.16, 4, "04");
    check("b06", "60", 77.13, 3, "ПК");
  });

  it("has rooms that add up to the total, except where the drawing itself does not", () => {
    const off = apartments
      .filter((a) => a.projectId === "city-center")
      .filter((a) => Math.abs(a.rooms.reduce((sum, r) => sum + r.area, 0) - a.area) > 0.011)
      .map((a) => `${a.buildingId}:${a.number}`);
    // the two apartments whose drawings disagree with themselves (docs/content-needed.md, "to confirm with the architect")
    expect(off.sort()).toEqual(["b02:4", "b05:4"]);
  });

  it("has every apartment available, unique ids, its own plan and an outline on its floor's sketch", () => {
    expect(new Set(apartments.map((a) => a.id)).size).toBe(apartments.length);
    for (const a of apartments.filter((x) => x.projectId === "city-center")) {
      expect(a.status).toBe("available");
      expect(a.outline?.polygon.length, a.id).toBeGreaterThan(2);
      expect(a.planImage?.transparent, a.id).toBe(true);
      for (const [x, y] of [...a.outline!.polygon, a.outline!.label]) {
        expect(x >= 0 && x <= 100 && y >= 0 && y <= 100, a.id).toBe(true);
      }
    }
  });

  it("has every sketch and plan file in public/", () => {
    const missing: string[] = [];
    for (const b of buildings) {
      for (const f of b.floors)
        if (!f.sketch || !existsSync(`public${f.sketch.src}`)) missing.push(`${b.id} ${f.label}`);
    }
    for (const a of apartments) if (a.planImage && !existsSync(`public${a.planImage.src}`)) missing.push(a.id);
    expect(missing).toEqual([]);
  });

  it("looks up an apartment by its id", () => {
    expect(getApartment("b06-f2-11a")?.number).toBe("11a");
  });
});

// What the architect's drawings give per building (Ламела 1–6): the apartments, the smallest and the largest, the floors.
describe("City Center's buildings, counted from the apartments", () => {
  const drawn = [
    { id: "b01", apartments: 30, min: 79.25, max: 186.9 },
    { id: "b02", apartments: 30, min: 79.25, max: 209.7 },
    { id: "b03", apartments: 35, min: 42.2, max: 177.35 },
    { id: "b04", apartments: 23, min: 57.33, max: 208.59 },
    { id: "b05", apartments: 24, min: 28.7, max: 186.9 },
    { id: "b06", apartments: 65, min: 52.82, max: 124.83 },
  ];
  it.each(drawn)(
    "$id has $apartments apartments from $min to $max m² on 6 floors",
    ({ id, apartments: count, min, max }) => {
      const building = getBuilding(id)!;
      const areas = of(id).map((a) => a.area);
      expect(of(id)).toHaveLength(count);
      expect(building.totalApartments).toBe(count);
      expect(building.floors).toHaveLength(6);
      expect([Math.min(...areas), Math.max(...areas)]).toEqual([min, max]);
      expect(building.areaRange).toEqual({ min, max });
    }
  );
  it("shows each building's range rounded to whole m²", () => {
    expect(buildings.map((b) => formatAreaRange(b.areaRange!.min, b.areaRange!.max))).toEqual([
      "79–187 м²",
      "79–210 м²",
      "42–177 м²",
      "57–209 м²",
      "29–187 м²",
      "53–125 м²",
    ]);
  });
  it("gives the project page the same count and range, computed", () => {
    const stats = projects.find((p) => p.id === "city-center")!.stats!;
    expect(stats).toMatchObject({ buildings: 6, apartments: 207, areaMin: 28.7, areaMax: 209.7 });
  });
});
