import type { Orientation, ProjectStatus } from "@/types";

/**
 * An area with a decimal comma, as written in Macedonian: one decimal ("74,0 м²"), or the `decimals` the data has
 * ("94,05 м²" for an apartment from the architect's drawing, which has two). Done by hand because the "mk-MK" locale
 * data at build/SSR time can differ from a browser's, which would make the server and the browser disagree.
 */
export function formatArea(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace(".", ",")} м²`;
}

export function statusLabel(status: "available" | "reserved" | "sold"): string {
  return { available: "Достапен", reserved: "Резервиран", sold: "Продаден" }[status];
}

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "Завршено",
  "under-construction": "Во изградба",
  upcoming: "Наскоро",
};

export function projectStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status];
}

const ORIENTATION_LABELS: Record<Orientation, string> = {
  North: "Север",
  South: "Југ",
  East: "Исток",
  West: "Запад",
  "North-East": "Северо-исток",
  "North-West": "Северо-запад",
  "South-East": "Југо-исток",
  "South-West": "Југо-запад",
};

export function orientationLabel(orientation: Orientation): string {
  return ORIENTATION_LABELS[orientation];
}

const TYPE_LABELS: Record<string, string> = {
  studio: "Студио",
  "1-bedroom": "Еднособен",
  "2-bedroom": "Двособен",
  "3-bedroom": "Трособен",
  "4-bedroom": "Четворособен",
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}
