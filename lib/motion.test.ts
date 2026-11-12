import { describe, expect, it } from "vitest";
import { startsBelowRevealLine } from "@/lib/motion";

describe("startsBelowRevealLine", () => {
  it("waits only when the top is at or below 95% of the screen's height", () => {
    expect(startsBelowRevealLine(950, 1000)).toBe(true);
    expect(startsBelowRevealLine(2400, 1000)).toBe(true);
    expect(startsBelowRevealLine(949, 1000)).toBe(false);
  });

  it("leaves what is on screen, or above it, as it is", () => {
    expect(startsBelowRevealLine(0, 1000)).toBe(false);
    expect(startsBelowRevealLine(-600, 1000)).toBe(false);
  });
});
