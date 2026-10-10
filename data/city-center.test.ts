import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { apartments, buildings, getApartment, getBuilding } from "@/data";

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

  it("has six floors in every building, from Кат 1 to Поткровје, and none on the ground floor", () => {
    for (const b of buildings) {
      expect(b.floors.map((f) => f.label)).toEqual(["Кат 1", "Кат 2", "Кат 3", "Кат 4", "Кат 5", "Поткровје"]);
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
    check("b01", "1", 186.9, 4, "Кат 1");
    check("b01", "6", 94.05, 3, "Кат 2");
    check("b01", "30", 94.05, 3, "Поткровје");
    check("b02", "4", 119.2, 3, "Кат 1");
    check("b02", "5", 209.7, 4, "Кат 1");
    check("b03", "12", 42.2, 2, "Кат 2");
    check("b03", "36", 42.2, 2, "Поткровје");
    check("b04", "1", 117.26, 3, "Кат 1");
    check("b04", "2", 133.07, 3, "Кат 1");
    check("b04", "3", 208.59, 4, "Кат 1");
    check("b05", "3", 28.7, 1, "Кат 1");
    check("b05", "8", 186.9, 5, "Кат 2");
    check("b05", "10", 81, 3, "Кат 3");
    check("b06", "11a", 52.82, 2, "Кат 2");
    check("b06", "33", 115.16, 4, "Кат 4");
    check("b06", "60", 77.13, 3, "Поткровје");
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
