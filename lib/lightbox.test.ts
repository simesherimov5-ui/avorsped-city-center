import { describe, expect, it } from "vitest";
import { captionOf, clampIndex, dragOffset, dragOutcome, growTransform, mostlyOnScreen } from "@/lib/lightbox";

describe("clampIndex", () => {
  it("stops at the ends", () => {
    expect(clampIndex(-1, 5)).toBe(0);
    expect(clampIndex(5, 5)).toBe(4);
    expect(clampIndex(2, 5)).toBe(2);
  });
});

describe("captionOf", () => {
  it("drops the project prefix and capitalises", () => {
    expect(captionOf("City Center — комплексот во зајдисонце")).toBe("Комплексот во зајдисонце");
    expect(captionOf("Станбена куќа 1 — кујна и трпезарија")).toBe("Кујна и трпезарија");
  });
  it("keeps an alt text without a prefix", () => {
    expect(captionOf("фасада")).toBe("Фасада");
  });
  it("has no caption without alt text", () => {
    expect(captionOf("")).toBe("");
    expect(captionOf(undefined)).toBe("");
    expect(captionOf("City Center — ")).toBe("");
  });
});

describe("dragOffset", () => {
  it("follows the finger between photos", () => {
    expect(dragOffset(-100, 2, 5)).toBe(-100);
    expect(dragOffset(100, 2, 5)).toBe(100);
  });
  it("moves 30% of the distance towards a missing photo", () => {
    expect(dragOffset(100, 0, 5)).toBeCloseTo(30);
    expect(dragOffset(-100, 4, 5)).toBeCloseTo(-30);
    expect(dragOffset(-100, 0, 5)).toBe(-100);
  });
});

describe("dragOutcome", () => {
  it("changes the photo after more than 18% of the width", () => {
    expect(dragOutcome(-200, 900, 1000, 1, 5)).toBe(1);
    expect(dragOutcome(200, 900, 1000, 1, 5)).toBe(-1);
    expect(dragOutcome(-170, 900, 1000, 1, 5)).toBe(0);
  });
  it("changes it on a flick faster than 0.45px/ms", () => {
    expect(dragOutcome(-60, 100, 1000, 1, 5)).toBe(1);
    expect(dragOutcome(-40, 100, 1000, 1, 5)).toBe(0);
  });
  it("snaps back at the ends", () => {
    expect(dragOutcome(300, 200, 1000, 0, 5)).toBe(0);
    expect(dragOutcome(-300, 200, 1000, 4, 5)).toBe(0);
  });
});

describe("growTransform", () => {
  it("scales uniformly by the widths and moves the centre", () => {
    const t = growTransform(
      { left: 100, top: 50, width: 200, height: 100 },
      { left: 0, top: 0, width: 800, height: 400 }
    );
    expect(t.scale).toBeCloseTo(0.25);
    expect(t.x).toBeCloseTo(200 - 400);
    expect(t.y).toBeCloseTo(100 - 200);
  });
});

describe("mostlyOnScreen", () => {
  it("needs at least half of the card inside the window", () => {
    expect(mostlyOnScreen({ left: 10, top: 10, width: 100, height: 100 }, 1000, 800)).toBe(true);
    expect(mostlyOnScreen({ left: 10, top: 760, width: 100, height: 100 }, 1000, 800)).toBe(false);
    expect(mostlyOnScreen({ left: 10, top: 700, width: 100, height: 100 }, 1000, 800)).toBe(true);
    expect(mostlyOnScreen({ left: 0, top: 0, width: 0, height: 0 }, 1000, 800)).toBe(false);
  });
});
