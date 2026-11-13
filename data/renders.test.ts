import { describe, expect, it } from "vitest";
import { apartments, render3dFor, renders3d } from "@/data";
import { render3dShown } from "@/lib/render3d";

const DIR = "/images/renders-3d/lamela-2";

// The agreed table: every Зграда 02 apartment (Стан 1 to 30) and the render file it shows in the 3D tab.
const EXPECTED: Record<string, string> = {
  "b02-f1-1": `${DIR}/stan-1.webp`,
  "b02-f1-2": `${DIR}/stan-2.webp`,
  "b02-f1-3": `${DIR}/stan-3.webp`,
  "b02-f1-4": `${DIR}/stan-4.webp`,
  "b02-f1-5": `${DIR}/stan-5.webp`,
  ...Object.fromEntries(
    [6, 7, 8, 9, 10].flatMap((first) => {
      const numbers = [first, first + 5, first + 10, first + 15, first + 20];
      const file = `${DIR}/stan-${numbers.join("-")}.webp`;
      return numbers.map((n, i) => [`b02-f${i + 2}-${n}`, file]);
    })
  ),
};

describe("3D renders", () => {
  const b02 = apartments.filter((a) => a.buildingId === "b02");

  it("maps all 30 Зграда 02 apartments to the agreed file", () => {
    const resolved = Object.fromEntries(b02.map((a) => [a.id, render3dFor(a.id)]));
    // the full list, for the review: apartment → file (and whether the file is in public/ yet)
    console.info(
      b02
        .map(
          (a) =>
            `Стан ${a.number.padEnd(3)} ${a.id.padEnd(10)} → ${render3dFor(a.id)} ${render3dShown(a.id) ? "present" : "pending"}`
        )
        .join("\n")
    );
    expect(b02).toHaveLength(30);
    expect(resolved).toEqual(EXPECTED);
  });

  it("lists the apartments whose viewer shows the ОСНОВА / 3D tabs (their render file is in public/)", () => {
    const withTabs = apartments.filter((a) => render3dShown(a.id)).map((a) => a.id);
    console.info(
      `Apartments with ОСНОВА / 3D tabs: ${withTabs.length}${withTabs.length ? ` (${withTabs.join(", ")})` : ""}`
    );
    // every apartment that shows tabs has a mapped render; none is shown without its file
    expect(withTabs.every((id) => render3dFor(id) !== undefined)).toBe(true);
  });

  it("gives Кат 04 → Стан 17 the render shared by 7, 12, 17, 22 and 27", () => {
    expect(render3dFor("b02-f4-17")).toBe("/images/renders-3d/lamela-2/stan-7-12-17-22-27.webp");
  });

  it("maps no apartment outside Зграда 02, and no id that does not exist", () => {
    const ids = new Set(apartments.map((a) => a.id));
    const mapped = renders3d.flatMap((r) => r.apartmentIds);
    expect(mapped.filter((id) => !ids.has(id))).toEqual([]);
    expect(mapped.filter((id) => !id.startsWith("b02-"))).toEqual([]);
    expect(new Set(mapped).size).toBe(mapped.length);
    expect(render3dFor("b01-f1-1")).toBeUndefined();
  });
});
