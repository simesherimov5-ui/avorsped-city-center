import { describe, expect, it } from "vitest";
import { orderCompanies, sideOf } from "./companies-layout";

describe("sideOf", () => {
  it("puts the names of nine companies like the reference: top above, the right half to the right, the left half to the left", () => {
    const sides = Array.from({ length: 9 }, (_, i) => sideOf(i, 9));
    expect(sides).toEqual(["t", "r", "r", "r", "r", "l", "l", "l", "l"]);
  });

  it("still gives an even ring for other counts, with a bottom point's name below it", () => {
    expect(Array.from({ length: 4 }, (_, i) => sideOf(i, 4))).toEqual(["t", "r", "b", "l"]);
    expect(sideOf(0, 1)).toBe("t");
  });
});

describe("orderCompanies", () => {
  const list = [{ name: "A" }, { name: "B" }, { name: "C" }];

  it("moves the named company to the front and keeps the order of the rest", () => {
    expect(orderCompanies(list, "C").map((c) => c.name)).toEqual(["C", "A", "B"]);
  });

  it("leaves the list alone when the company is not in it", () => {
    expect(orderCompanies(list, "Z").map((c) => c.name)).toEqual(["A", "B", "C"]);
  });
});
