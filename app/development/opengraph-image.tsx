import { projects } from "@/data";
import { OG_SIZE, OG_TYPE, renderOg } from "@/lib/og";

export const alt = "City Center — Јавор Шпед";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  const project = projects.find((p) => p.id === "city-center");
  return renderOg({
    label: "Јавор Шпед · Exclusive Building",
    title: project?.name ?? "City Center",
    subtitle: project?.tagline ?? project?.location,
    photo: project?.heroImage.src,
  });
}
