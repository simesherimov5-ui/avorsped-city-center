import type { Apartment } from "@/types";

/**
 * The plan to show for an apartment: the one its data carries (the architect's drawing, dark lines on a transparent
 * background, or a project's own plan), else an empty frame. No project borrows another project's plan.
 */
export function floorPlanImageForApartment(apartment: Apartment) {
  const own = apartment.planImage;
  if (own) {
    return {
      src: own.src,
      alt: own.alt,
      isPlaceholder: own.isPlaceholder,
      isExactMatch: true,
      // line drawings on a transparent background: kept lossless and always on a light surface
      transparent: own.transparent === true,
    };
  }
  return {
    src: "",
    alt: `Стан ${apartment.number}`,
    isPlaceholder: true as const,
    isExactMatch: false,
    transparent: false,
  };
}
