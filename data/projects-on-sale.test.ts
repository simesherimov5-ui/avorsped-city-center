import { describe, expect, it } from "vitest";
import { apartments, placeLabel, placeOf, projects, projectsOnSale } from "@/data";

describe("projectsOnSale", () => {
  const sale = projectsOnSale();

  it("lists every project that is not completed, in the order of the projects page", () => {
    expect(sale.map((p) => p.project.id)).toEqual(projects.filter((p) => p.status !== "completed").map((p) => p.id));
    expect(sale.length).toBeGreaterThan(1);
  });

  it("gives every apartment to a project on sale and to one building of it", () => {
    for (const a of apartments) {
      const own = sale.find((p) => p.project.id === a.projectId);
      expect(own, a.id).toBeDefined();
      expect(
        own!.buildings.some((b) => b.id === placeOf(a)),
        a.id
      ).toBe(true);
      expect(own!.apartments).toContain(a);
    }
    expect(sale.reduce((n, p) => n + p.apartments.length, 0)).toBe(apartments.length);
  });

  it("puts each apartment on a floor of its building, in order", () => {
    for (const { buildings } of sale) {
      for (const b of buildings) {
        const numbers = b.floors.map((f) => f.number);
        expect(numbers).toEqual([...numbers].sort((x, y) => x - y));
      }
    }
  });

  it("draws a project with no apartments as one building with no floors", () => {
    for (const { project, buildings, apartments: own } of sale) {
      if (own.length > 0) continue;
      expect(buildings).toEqual([{ id: project.id, name: project.name, floors: [] }]);
    }
  });

  it("marks the apartments that are generated sample data, and only those", () => {
    // the architect's plans (City Center) are real; the other projects' lists are sample data until the real ones arrive
    for (const a of apartments) expect(a.sample === true, a.id).toBe(a.projectId !== "city-center");
  });

  it("names where an apartment is: the project, and the building when the project has several", () => {
    const cityCenter = apartments.find((a) => a.projectId === "city-center")!;
    const single = apartments.find((a) => !a.buildingId)!;
    expect(placeLabel(cityCenter).text).toContain(" · ");
    expect(placeLabel(single).text).toBe(placeLabel(single).project);
  });
});
