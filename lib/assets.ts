import type { Apartment } from "@/types";

// Real architectural floor-plan renders supplied for the project, matched to
// the closest unit type by Macedonian room-count convention (собa count
// includes the living room): studio->1-room, 1-bedroom->2-room, etc.
const FLOOR_PLAN_IMAGE: Record<Apartment["type"], { src: string; alt: string }> = {
  studio: { src: "/images/floorplans/1-room-28.70.jpg", alt: "Пример: еднособен стан, 28.70 м²" },
  "1-bedroom": { src: "/images/floorplans/2-room-59.15.jpg", alt: "Пример: двособен стан, 59.15 м²" },
  "2-bedroom": { src: "/images/floorplans/3-room-79.72.jpg", alt: "Пример: трособен стан, 79.72 м²" },
  "3-bedroom": { src: "/images/floorplans/5-room-170-a.jpg", alt: "Пример: петособен стан, 170 м²" },
  "4-bedroom": { src: "/images/floorplans/5-room-170-b.jpg", alt: "Пример: петособен стан, 170 м²" },
};

// Exact per-apartment floor plans for Building 06 / Floor 3, taken directly from
// the project's real architectural documentation (not a type-matched example).
const REAL_FLOOR_PLAN_BY_ID: Record<string, { src: string; alt: string }> = Object.fromEntries(
  ["21", "21а", "22", "23", "24", "25", "26", "27", "28", "29", "30"].map((number) => [
    // keyed by the apartment's id, which is plain ASCII ("21а" is "21a" there)
    `b06-f3-${number.replace("а", "a")}`,
    {
      src: `/images/floorplans/b06-f3/apt-${number.replace("а", "a")}.png`,
      alt: `Архитектонска основа на стан ${number}, Зграда 06, Кат 3`,
    },
  ])
);

export function floorPlanImageForApartment(apartment: Apartment) {
  const real = REAL_FLOOR_PLAN_BY_ID[apartment.id];
  if (real) return { ...real, isPlaceholder: false as const, isExactMatch: true };
  return { ...FLOOR_PLAN_IMAGE[apartment.type], isPlaceholder: false as const, isExactMatch: false };
}

// Real pixel dimensions of the source PNG — the only copy of this drawing in the
// repo; there is no higher-resolution or vector (CAD/DWG) version available.
export const b06Floor3Overview = {
  src: "/images/floorplans/b06-f3/overview.png",
  alt: "Основа на цел кат — Зграда 06, Кат 3",
  isPlaceholder: false as const,
  width: 1800,
  height: 1273,
};
