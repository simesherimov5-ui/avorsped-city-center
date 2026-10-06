import type { Company } from "@/components/company-ticker/companies";

/**
 * Which side of its point a company's name goes on, for point `index` of `count` on a ring that starts at the top and
 * runs clockwise: the right half → right, the left half → left, the point at the very top → above, and (for counts
 * that put one there) the point at the very bottom → below.
 */
export function sideOf(index: number, count: number): "r" | "l" | "t" | "b" {
  const angle = ((-90 + index * (360 / count)) * Math.PI) / 180;
  const cos = Math.cos(angle);
  if (cos > 0.3) return "r";
  if (cos < -0.3) return "l";
  return Math.sin(angle) < 0 ? "t" : "b";
}

/** The company this site belongs to first, the others in their own order. */
export function orderCompanies(companies: Company[], first: string): Company[] {
  return [...companies.filter((c) => c.name === first), ...companies.filter((c) => c.name !== first)];
}
