import { describe, expect, it } from "vitest";
import { boxSizes, cappedWidth, OPTIMIZER_WIDTHS, wholeSizes } from "@/lib/image-sizes";
import nextConfig from "../next.config";

describe("boxSizes", () => {
  it("gives the width the box placement draws, one entry per layout, then the fallback", () => {
    const sizes = boxSizes("/images/radovish-twins/exterior-01.jpg", { x: 17.8, y: 1.3, w: 67.1, h: 86.7 }, [
      { media: "(min-aspect-ratio: 130/100)", w: "100vw", h: "100svh", top: "101px" },
    ]);
    expect(sizes).toBe(
      "(min-aspect-ratio: 130/100) min(max(100vw, 100svh * 1.7768), 100vw / 0.671, (100svh - 101px) * 1.7768 / 0.867), 100vw"
    );
  });
});

describe("cappedWidth", () => {
  it("asks for a width the photo has as it is", () => {
    expect(cappedWidth(1080, 1672)).toBe(1080);
    expect(cappedWidth(1672, 1672)).toBe(1672);
  });

  it("holds a wider request at an accepted width that covers the file, never a width off the list", () => {
    expect(cappedWidth(2400, 1672)).toBe(1920);
    expect(cappedWidth(3200, 3200)).toBe(3200);
    expect(cappedWidth(3840, 3000)).toBe(3200);
  });

  it("only uses widths next.config.ts accepts", () => {
    expect([...OPTIMIZER_WIDTHS]).toEqual(nextConfig.images?.deviceSizes);
  });
});

describe("wholeSizes", () => {
  it("is the smallest of the file's own width, the frame width and the frame height times the proportions", () => {
    expect(
      wholeSizes("/images/radovish-twins/exterior-06.jpg", 1672, [
        { media: "(min-width: 1024px)", w: "100vw", h: "max(560px, 100svh) - 85px" },
        { w: "100vw" },
      ])
    ).toBe("(min-width: 1024px) min(1672px, 100vw, (max(560px, 100svh) - 85px) * 1.7768), min(1672px, 100vw)");
  });
});
