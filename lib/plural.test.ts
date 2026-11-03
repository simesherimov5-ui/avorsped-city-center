import { describe, expect, it } from "vitest";
import { floorsText, roomsText, unitsText } from "./plural";

describe("roomsText", () => {
  it("writes one room as «1 соба» and every other number as «N соби»", () => {
    expect(roomsText(1)).toBe("1 соба");
    expect(roomsText(2)).toBe("2 соби");
    expect(roomsText(3)).toBe("3 соби");
    expect(roomsText(5)).toBe("5 соби");
    expect(roomsText(11)).toBe("11 соби");
  });
});

describe("unitsText and floorsText", () => {
  it("use the singular only for exactly 1", () => {
    expect(unitsText(1)).toBe("1 стан");
    expect(unitsText(30)).toBe("30 станови");
    expect(floorsText(1)).toBe("1 кат");
    expect(floorsText(5)).toBe("5 ката");
  });
});
