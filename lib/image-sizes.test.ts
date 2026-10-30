import { describe, expect, it } from "vitest";
import { boxSizes } from "@/lib/image-sizes";

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
