import type { Orientation, ProjectStatus } from "@/types";

export function formatPrice(value: number): string {
  // Manual thousands-grouping instead of Intl.NumberFormat: the "mk-MK"
  // locale data available at build/SSR time can differ from a browser's,
  // producing a server/client hydration mismatch on the exact same value.
  const grouped = Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${grouped} €`;
}

export function formatArea(value: number): string {
  return `${value.toFixed(1)} м²`;
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
