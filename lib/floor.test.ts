import { describe, expect, it } from "vitest";
import { floorTitle } from "./floor";

describe("floorTitle", () => {
  it("writes a floor number as «Кат 01» and the attic as «Поткровје»", () => {
    expect(floorTitle("01")).toBe("Кат 01");
    expect(floorTitle("05")).toBe("Кат 05");
    expect(floorTitle("ПК")).toBe("Поткровје");
  });
  it("leaves any other name as it is", () => {
    expect(floorTitle("Кат 1")).toBe("Кат 1");
  });
});
