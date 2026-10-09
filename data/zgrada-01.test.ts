import { describe, expect, it } from "vitest";
import { apartments, getBuilding, placeLabel } from "@/data";

// Зграда 01 (Ламела 1): the architect's drawing, the only building with real data so far.
const units = apartments.filter((a) => a.buildingId === "b01");
const building = getBuilding("b01")!;

describe("Зграда 01", () => {
  it("has six levels of five apartments, 30 in all, and no ground floor", () => {
    expect(units).toHaveLength(30);
    expect(building.totalApartments).toBe(30);
    expect(building.floors.map((f) => f.label)).toEqual(["Кат 1", "Кат 2", "Кат 3", "Кат 4", "Кат 5", "Поткровје"]);
    expect(building.floors.some((f) => f.number === 0)).toBe(false);
    for (const floor of building.floors) expect(floor.apartmentIds).toHaveLength(5);
  });

  it("numbers the apartments 1 to 30 as the drawing does, five to a level", () => {
    expect(units.map((a) => a.number)).toEqual(Array.from({ length: 30 }, (_, i) => String(i + 1)));
    const byNumber = (n: number) => units.find((a) => a.number === String(n))!;
    expect(byNumber(8).floor).toBe(2);
    expect(byNumber(21).floor).toBe(5);
    expect(byNumber(30).floor).toBe(6);
    expect(placeLabel(byNumber(21)).text).toBe("City Center · Зграда 01");
  });

  it("gives the same position on every level the same type", () => {
    const types = ["A", "B", "C", "D", "E"];
    for (const a of units) {
      expect(a.planType, a.id).toBe(types[a.position! - 1]);
      expect(a.position).toBe(((Number(a.number) - 1) % 5) + 1);
    }
  });

  it("has the architect's areas and number of rooms, and rooms that add up to the total", () => {
    const expected: Record<string, [number, number]> = {
      A: [94.05, 3],
      B: [89.1, 3],
      C: [79.25, 3],
      D: [89.1, 3],
      E: [94.05, 4],
    };
    for (const a of units) {
      const [area, rooms] = expected[a.planType!];
      expect(a.area, a.id).toBe(area);
      expect(a.bedrooms, a.id).toBe(rooms);
      expect(a.rooms.reduce((sum, r) => sum + r.area, 0)).toBeCloseTo(area, 2);
      expect(a.areaDecimals).toBe(2);
      expect(a.sample).toBeUndefined();
      expect(a.orientation).toBeUndefined();
      expect(a.planImage?.src).toBe(`/images/floorplans/b01/tip-${a.planType!.toLowerCase()}.webp`);
    }
  });

  it("has one floor sketch with a shape for each of the five positions, inside the picture", () => {
    const sketch = building.floorSketch!;
    expect(sketch.image).toMatchObject({ src: "/images/floorplans/b01/kat.webp", width: 3200, height: 1872 });
    expect(sketch.shapes.map((s) => s.position)).toEqual([1, 2, 3, 4, 5]);
    for (const shape of sketch.shapes) {
      for (const [x, y] of [...shape.polygon, shape.label]) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(100);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(100);
      }
    }
  });

  it("leaves the other buildings' data alone", () => {
    expect(getBuilding("b02")!.floorSketch).toBeUndefined();
    expect(apartments.filter((a) => a.buildingId === "b02").every((a) => a.sample)).toBe(true);
  });
});
