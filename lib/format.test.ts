import { describe, expect, it } from "vitest";
import { formatArea, formatPrice, orientationLabel, projectStatusLabel, statusLabel, typeLabel } from "@/lib/format";

describe("formatPrice", () => {
  it("groups thousands with dots and appends the euro sign", () => {
    expect(formatPrice(999)).toBe("999 €");
    expect(formatPrice(1000)).toBe("1.000 €");
    expect(formatPrice(1234567)).toBe("1.234.567 €");
  });

  it("rounds to whole euros before grouping", () => {
    expect(formatPrice(1234.6)).toBe("1.235 €");
    expect(formatPrice(0)).toBe("0 €");
  });
});

describe("formatArea", () => {
  it("uses one decimal and the м² unit", () => {
    expect(formatArea(79.72)).toBe("79,7 м²");
    expect(formatArea(28.7)).toBe("28,7 м²");
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
