import type { Project, ProjectStatus } from "@/types";

/** The status tabs of the projects page; "soon" is only offered when the data has such a project. */
export type StatusFilter = "all" | "build" | "done" | "soon";
export type CityFilter = "all" | string;
export type View = "grid" | "map";

export const STATUS_OF: Record<Exclude<StatusFilter, "all">, ProjectStatus> = {
  build: "under-construction",
  done: "completed",
  soon: "upcoming",
};

/** Where a project sits in a city's list: the ones being built first, then the ones coming, then the finished ones. */
const STATUS_ORDER: Record<ProjectStatus, number> = { "under-construction": 0, upcoming: 1, completed: 2 };

/** Where each city's pin stands on the map drawing, as a percentage of the box (from the design board). */
export const CITY_PINS: Record<string, { x: number; y: number }> = {
  Радовиш: { x: 30.7, y: 21.6 },
  Струмица: { x: 56.1, y: 48.4 },
  Дојран: { x: 67.4, y: 82.0 },
};

export interface CityGroup {
  /** "" for projects that have no city: they form a last group without a heading. */
  city: string;
  projects: Project[];
}

const matchesStatus = (project: Project, status: StatusFilter) =>
  status === "all" || project.status === STATUS_OF[status];

/** The projects that pass both filters, in the order of the data. */
export function filterProjects(projects: Project[], status: StatusFilter, city: CityFilter) {
  return projects.filter((p) => matchesStatus(p, status) && (city === "all" || p.city === city));
}

/**
 * The projects grouped by city: the city with the most projects first (equal numbers А–Я), inside a city the projects
 * being built first, then the coming ones, then the finished ones, each in the order of the data. A project without a
 * city goes into a last group with an empty name. The count that orders the groups is the number of projects shown.
 */
export function groupByCity(projects: Project[]): CityGroup[] {
  const byCity = new Map<string, Project[]>();
  for (const project of projects) {
    const list = byCity.get(project.city) ?? [];
    list.push(project);
    byCity.set(project.city, list);
  }
  const groups = [...byCity.entries()]
    .filter(([city]) => city !== "")
    .map(([city, list]) => ({
      city,
      // sort() is stable, so projects of the same status keep the order of the data
      projects: [...list].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    }))
    .sort((a, b) => b.projects.length - a.projects.length || a.city.localeCompare(b.city, "mk"));
  const without = byCity.get("");
  if (without)
    groups.push({ city: "", projects: [...without].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) });
  return groups;
}

/** Every city that has a project, А–Я, with how many projects it has in all. */
export function citiesWithCounts(projects: Project[]) {
  const counts = new Map<string, number>();
  for (const p of projects) if (p.city) counts.set(p.city, (counts.get(p.city) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], "mk")).map(([city, count]) => ({ city, count }));
}

/** "1 проект", "2 проекти". */
export const projectsText = (count: number) => `${count} ${count === 1 ? "проект" : "проекти"}`;

/** Reads the three choices out of the address; anything that is not valid falls back to "all" / "grid". */
export function parseChoices(
  params: { get(name: string): string | null },
  projects: Project[]
): { status: StatusFilter; city: CityFilter; view: View } {
  const s = params.get("status");
  const hasSoon = projects.some((p) => p.status === "upcoming");
  const status: StatusFilter = s === "build" || s === "done" || (s === "soon" && hasSoon) ? (s as StatusFilter) : "all";
  const c = params.get("city");
  const city = c && projects.some((p) => p.city === c) ? c : "all";
  const view: View = params.get("view") === "map" ? "map" : "grid";
  return { status, city, view };
}

/** The address for the three choices: only what differs from the default is written. */
export function choicesQuery(status: StatusFilter, city: CityFilter, view: View) {
  const q = new URLSearchParams();
  if (status !== "all") q.set("status", status);
  if (city !== "all") q.set("city", city);
  if (view !== "grid") q.set("view", view);
  const text = q.toString();
  return text ? `?${text}` : "";
}

/** The hero's slides: projects with a main photo, the ones being built first, at most five. */
export function heroSlides(projects: Project[]) {
  return projects
    .filter((p) => !p.heroImage.isPlaceholder && p.heroImage.src !== "")
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
    .slice(0, 5);
}
