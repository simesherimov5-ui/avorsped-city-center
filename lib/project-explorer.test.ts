import { describe, expect, it } from "vitest";
import type { Project } from "@/types";
import { projects } from "@/data";
import {
  carouselProjects,
  choicesQuery,
  citiesWithCounts,
  filterProjects,
  groupByCity,
  heroSlides,
  otherProjects,
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

describe("carouselProjects and heroSlides (the real data)", () => {
  it("lists every project being built, stubs too, the ones with a photo first, each in the order of the data", () => {
    expect(carouselProjects(projects).map((x) => x.id)).toEqual([
      "city-center",
      "stanbena-kukja",
      "dojranski-raj",
      "radovish-twins",
      "stanbena-kukja-2",
      "city-center-2",
      "boro-pochkov",
      "dojranski-raj-2",
    ]);
  });

  it("never lists a finished or a coming project", () => {
    expect(carouselProjects(projects).every((x) => x.status === "under-construction")).toBe(true);
  });

  it("puts the projects with a wide slide photo first in the Проекти hero", () => {
    expect(heroSlides(projects).map((x) => x.id)).toEqual([
      "city-center",
      "dojranski-raj",
      "radovish-twins",
      "stanbena-kukja",
      "stanbena-kukja-2",
      "city-center-2",
      "boro-pochkov",
      "dojranski-raj-2",
    ]);
  });

  it("moves a project up by itself once the data gives it a photo (here only in the test, not in the data)", () => {
    const photo = { src: "/images/test/boro-pochkov.jpg", alt: "Боро Почков", isPlaceholder: false };
    const withPhoto = projects.map((x) =>
      x.id === "boro-pochkov" ? { ...x, heroImage: photo, slideImage: photo } : x
    );
    expect(
      carouselProjects(withPhoto)
        .map((x) => x.id)
        .slice(0, 5)
    ).toEqual(["city-center", "stanbena-kukja", "dojranski-raj", "radovish-twins", "boro-pochkov"]);
    expect(
      heroSlides(withPhoto)
        .map((x) => x.id)
        .slice(0, 4)
    ).toEqual(["city-center", "dojranski-raj", "radovish-twins", "boro-pochkov"]);
    // the data itself is untouched
    expect(projects.find((x) => x.id === "boro-pochkov")?.heroImage.isPlaceholder).toBe(true);
  });
});

describe("otherProjects", () => {
  const photo = { src: "/x.jpg", alt: "", isPlaceholder: false };
  const q = (id: string, status: Project["status"], extra: Partial<Project> = {}) =>
    ({ id, status, heroImage: photo, ...extra }) as Project;

  it("leaves out the current project, the ones known only by name and the ones without a photo", () => {
    const list = [
      q("a", "completed"),
      q("b", "under-construction"),
      q("c", "under-construction"),
      q("stub", "under-construction", { stub: true }),
      q("bare", "completed", { heroImage: { src: "", alt: "", isPlaceholder: true } }),
      q("soon", "upcoming"),
    ];
    expect(otherProjects(list, "c").map((x) => x.id)).toEqual(["b", "a", "soon"]);
  });
  it("lists the ones being built first, then the finished ones, and stops at six", () => {
    const list = [
      ...["d1", "d2", "d3", "d4"].map((id) => q(id, "completed")),
      ...["b1", "b2", "b3", "b4"].map((id) => q(id, "under-construction")),
    ];
    expect(otherProjects(list, "none").map((x) => x.id)).toEqual(["b1", "b2", "b3", "b4", "d1", "d2"]);
  });
});
