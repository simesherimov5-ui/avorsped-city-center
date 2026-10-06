import { describe, expect, it } from "vitest";
import { apartments, getApartment } from "@/data";

describe("apartment ids", () => {
  it("are plain ASCII and URL-safe, so a route never has to decode them", () => {
    for (const a of apartments) {
      expect(a.id, a.id).toMatch(/^[a-z0-9-]+$/);
      expect(encodeURIComponent(a.id)).toBe(a.id);
    }
  });

  it("are unique and each one resolves to its own apartment", () => {
    expect(new Set(apartments.map((a) => a.id)).size).toBe(apartments.length);
    for (const a of apartments) expect(getApartment(a.id)).toBe(a);
  });

  it("keep the Cyrillic unit number only as the label (Building 06, floor 3, unit 21а)", () => {
    const a = getApartment("b06-f3-21a");
    expect(a?.number).toBe("21а");
  });
});

// Against a running server (`npm run build && npm start`, then CHECK_BASE_URL=http://localhost:3000 npm test): every
// apartment page answers 200. Skipped when no server is given.
describe.skipIf(!process.env.CHECK_BASE_URL)("apartment pages", () => {
  it("every apartment id opens with status 200", async () => {
    const base = process.env.CHECK_BASE_URL!;
    const failures: string[] = [];
    for (let i = 0; i < apartments.length; i += 12) {
      const batch = apartments.slice(i, i + 12);
      const results = await Promise.all(
        batch.map(async (a) => ({ id: a.id, status: (await fetch(`${base}/apartments/${a.id}`)).status }))
      );
      for (const r of results) if (r.status !== 200) failures.push(`${r.id} -> ${r.status}`);
    }
    expect(failures).toEqual([]);
  }, 120_000);
});
