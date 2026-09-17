import type { Orientation } from "@/types";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("mk-MK", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatArea(value: number): string {
  return `${value.toFixed(1)} м²`;
}

export function statusLabel(status: "available" | "reserved" | "sold"): string {
  return { available: "Достапен", reserved: "Резервиран", sold: "Продаден" }[status];
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
