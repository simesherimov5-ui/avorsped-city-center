import type { Apartment } from "@/types";

export type ApartmentSort = "price-asc" | "price-desc" | "area-asc" | "area-desc";

/** "" is the default order (by building and floor, as the data lists them). */
export const SORT_OPTIONS: { value: ApartmentSort | ""; label: string }[] = [
  { value: "", label: "Зграда и кат" },
  { value: "price-asc", label: "Цена: од ниска кон висока" },
  { value: "price-desc", label: "Цена: од висока кон ниска" },
  { value: "area-asc", label: "Површина: од мала кон голема" },
  { value: "area-desc", label: "Површина: од голема кон мала" },
];

export const isApartmentSort = (value: string | null | undefined): value is ApartmentSort =>
  value === "price-asc" || value === "price-desc" || value === "area-asc" || value === "area-desc";

/** A sorted copy. Equal values keep their default order, so the list never shuffles between two equal prices. */
export function sortApartments<T extends Pick<Apartment, "price" | "area">>(list: T[], sort: ApartmentSort | ""): T[] {
  if (!sort) return list;
  const [key, direction] = sort.split("-") as ["price" | "area", "asc" | "desc"];
  const sign = direction === "asc" ? 1 : -1;
  return [...list].sort((a, b) => sign * (a[key] - b[key]));
}
