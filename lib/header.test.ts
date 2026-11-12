import { describe, expect, it } from "vitest";
import { parseNavHeight } from "@/lib/header";

describe("parseNavHeight", () => {
  it("reads the pixels of the shared --nav-h", () => {
    expect(parseNavHeight("90px")).toBe(90);
    expect(parseNavHeight(" 64px ")).toBe(64);
    expect(parseNavHeight("72.5px")).toBe(72.5);
  });

  it("falls back to the desktop height for anything that is not a length", () => {
    expect(parseNavHeight("")).toBe(90);
    expect(parseNavHeight("auto")).toBe(90);
    expect(parseNavHeight("0px")).toBe(90);
    expect(parseNavHeight("", 64)).toBe(64);
  });
});
