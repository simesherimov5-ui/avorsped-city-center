import { describe, expect, it } from "vitest";
import type { Project } from "@/types";
import {
  choicesQuery,
  citiesWithCounts,
  filterProjects,
  groupByCity,
  parseChoices,
  projectsText,
} from "./project-explorer";

const p = (id: string, city: string, status: Project["status"]) => ({ id, city, status }) as Project;

const data = [
  p("a", "Струмица", "completed"),
  p("b", "Дојран", "under-construction"),
  p("c", "Струмица", "under-construction"),
  p("d", "Радовиш", "upcoming"),
  p("e", "Струмица", "upcoming"),
  p("f", "", "completed"),
];

describe("groupByCity", () => {
  it("puts the city with the most projects first, then А–Я, and a project without a city last", () => {
    expect(groupByCity(data).map((g) => g.city)).toEqual(["Струмица", "Дојран", "Радовиш", ""]);
  });
  it("lists the ones being built first, then the coming ones, then the finished ones", () => {
    expect(groupByCity(data)[0].projects.map((x) => x.id)).toEqual(["c", "e", "a"]);
  });
});

describe("filters", () => {
  it("filters by status and city together", () => {
    expect(filterProjects(data, "build", "Струмица").map((x) => x.id)).toEqual(["c"]);
    expect(filterProjects(data, "all", "all")).toHaveLength(6);
  });
  it("counts the projects of every city, А–Я", () => {
    expect(citiesWithCounts(data)).toEqual([
      { city: "Дојран", count: 1 },
      { city: "Радовиш", count: 1 },
      { city: "Струмица", count: 3 },
    ]);
  });
});

describe("the address", () => {
  it("round-trips the three choices and ignores invalid ones", () => {
    expect(choicesQuery("build", "Струмица", "map")).toBe(
      "?status=build&city=%D0%A1%D1%82%D1%80%D1%83%D0%BC%D0%B8%D1%86%D0%B0&view=map"
    );
    expect(choicesQuery("all", "all", "grid")).toBe("");
    const params = new URLSearchParams("status=zzz&city=Нигде&view=map");
    expect(parseChoices(params, data)).toEqual({ status: "all", city: "all", view: "map" });
    expect(parseChoices(new URLSearchParams("status=done&city=Дојран"), data)).toEqual({
      status: "done",
      city: "Дојран",
      view: "grid",
    });
  });
  it("writes 1 проект and 2 проекти", () => {
    expect(projectsText(1)).toBe("1 проект");
    expect(projectsText(2)).toBe("2 проекти");
  });
});
