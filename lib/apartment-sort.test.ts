import { describe, expect, it } from "vitest";
import { isApartmentSort, sortApartments } from "@/lib/apartment-sort";

const list = [
  { id: "a", price: 120_000, area: 60 },
  { id: "b", price: 90_000, area: 45 },
  { id: "c", price: 150_000, area: 60 },
  { id: "d", price: 90_000, area: 80 },
];
const ids = (sorted: typeof list) => sorted.map((x) => x.id).join("");

describe("sortApartments", () => {
  it("keeps the default order when no sort is chosen", () => {
    expect(ids(sortApartments(list, ""))).toBe("abcd");
  });

  it("sorts by price, low to high and high to low", () => {
    expect(ids(sortApartments(list, "price-asc"))).toBe("bdac");
    expect(ids(sortApartments(list, "price-desc"))).toBe("cabd");
  });

  it("sorts by area, small to large and large to small", () => {
    expect(ids(sortApartments(list, "area-asc"))).toBe("bacd");
    expect(ids(sortApartments(list, "area-desc"))).toBe("dacb");
  });

  it("does not change the list it was given", () => {
    sortApartments(list, "price-desc");
    expect(ids(list)).toBe("abcd");
  });
});

describe("isApartmentSort", () => {
  it("accepts the four sorts and nothing else", () => {
    expect(isApartmentSort("price-asc")).toBe(true);
    expect(isApartmentSort("area-desc")).toBe(true);
    expect(isApartmentSort("name")).toBe(false);
    expect(isApartmentSort(null)).toBe(false);
  });
});
