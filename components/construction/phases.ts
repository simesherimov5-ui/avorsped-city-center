import type { ConstructionPhase, Project } from "@/types";

/** The five phases every building project goes through, in order. */
export const CONSTRUCTION_PHASES: { key: ConstructionPhase; label: string }[] = [
  { key: "foundation", label: "Темели" },
  { key: "structure", label: "Конструкција" },
  { key: "facade", label: "Фасада" },
  { key: "interior", label: "Ентериер" },
  { key: "handover", label: "Предавање" },
];

/**
 * The one rule for who gets a progress section: the project is under construction and has progress data.
 * (Plain module, not the client component, so server pages can call it too.)
 */
export const showsConstructionProgress = (project: Pick<Project, "status" | "construction">) =>
  project.status === "under-construction" && Boolean(project.construction);
