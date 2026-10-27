import { describe, expect, it } from "vitest";
import { formatArea, listNames, orientationLabel, projectStatusLabel, typeLabel } from "@/lib/format";

describe("listNames", () => {
  it("puts commas between the names and «и» only before the last", () => {
    expect(listNames(["City Center", "Станбена куќа 1", "Дојрански Рај"])).toBe(
      "City Center, Станбена куќа 1 и Дојрански Рај"
    );
    expect(listNames(["City Center", "Дојрански Рај"])).toBe("City Center и Дојрански Рај");
  });

  it("returns one name as it is, and nothing for none", () => {
    expect(listNames(["City Center"])).toBe("City Center");
    expect(listNames([])).toBe("");
  });
});

describe("formatArea", () => {
  it("uses one decimal and the м² unit", () => {
    expect(formatArea(79.72)).toBe("79,7 м²");
    expect(formatArea(28.7)).toBe("28,7 м²");
  });

  it("uses the decimals the data has when it says so (the architect's areas have two)", () => {
    expect(formatArea(94.05, 2)).toBe("94,05 м²");
    expect(formatArea(89.1, 2)).toBe("89,10 м²");
    expect(formatArea(45, 2)).toBe("45,00 м²");
  });
});

describe("labels", () => {
  it("maps project statuses and orientations", () => {
    expect(projectStatusLabel("under-construction")).toBe("Во изградба");
    expect(orientationLabel("North-East")).toBe("Северо-исток");
  });

  it("falls back to the raw key for unknown apartment types", () => {
    expect(typeLabel("2-bedroom")).toBe("Двособен");
    expect(typeLabel("penthouse")).toBe("penthouse");
  });
});
