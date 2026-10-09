import { describe, expect, it } from "vitest";
import { showsCompareBar } from "./CompareBar";

describe("showsCompareBar", () => {
  it("is on where apartments are chosen, and under those paths", () => {
    for (const path of [
      "/apartments",
      "/apartments/b01-f0-001",
      "/projects",
      "/projects/stanbena-kukja",
      "/completed-projects",
      "/development",
      "/development/b01/3",
      "/dojran",
      "/dojran/2",
    ])
      expect(showsCompareBar(path), path).toBe(true);
  });

  it("is off everywhere else, including a path that only starts with the same letters", () => {
    for (const path of ["/", "/about", "/contact", "/not-found", "/projects-archive", "/apartmentsx"])
      expect(showsCompareBar(path), path).toBe(false);
  });
});
