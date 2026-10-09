import { OG_SIZE, OG_TYPE, renderOg } from "@/lib/og";

export const alt = "Javor Sped Holding";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return renderOg({
    label: "Јавор Шпед",
    title: "Javor Sped Holding",
    subtitle: "Премиум станбени проекти во Струмица и Дојран",
    photo: "/images/exteriors/exterior-hero-wide.jpg",
  });
}
