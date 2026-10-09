import { describe, expect, it } from "vitest";
import { formatArea, orientationLabel, projectStatusLabel, statusLabel, typeLabel } from "@/lib/format";

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
  it("maps every unit status to a Macedonian label", () => {
    expect(statusLabel("available")).toBe("Достапен");
    expect(statusLabel("reserved")).toBe("Резервиран");
    expect(statusLabel("sold")).toBe("Продаден");
  });

  it("maps project statuses and orientations", () => {
    expect(projectStatusLabel("under-construction")).toBe("Во изградба");
    expect(orientationLabel("North-East")).toBe("Северо-исток");
  });

  it("falls back to the raw key for unknown apartment types", () => {
    expect(typeLabel("2-bedroom")).toBe("Двособен");
    expect(typeLabel("penthouse")).toBe("penthouse");
  });
});
