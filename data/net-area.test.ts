import { describe, expect, it } from "vitest";
import { apartments } from "@/data";

describe("netArea (the apartment page's «Површина»)", () => {
  it("is the total less the terrace for every apartment, until the company's own figure replaces it", () => {
    for (const a of apartments) {
      const decimals = a.areaDecimals ?? 1;
      expect(a.netArea, a.id).toBeCloseTo(a.area - a.balconyArea, decimals);
    }
  });

  it("is never more than the total and always a real area", () => {
    for (const a of apartments) {
      expect(a.netArea, a.id).toBeGreaterThan(10);
      expect(a.netArea, a.id).toBeLessThanOrEqual(a.area);
    }
  });

  it("matches the rooms inside, for a sample apartment, whose rooms are made from it", () => {
    const sample = apartments.filter((a) => a.sample);
    expect(sample.length).toBeGreaterThan(0);
    for (const a of sample) {
      const inside = a.rooms.filter((r) => r.name !== "Тераса").reduce((sum, r) => sum + r.area, 0);
      expect(Math.abs(inside - a.netArea), a.id).toBeLessThan(2.5);
    }
  });
});
