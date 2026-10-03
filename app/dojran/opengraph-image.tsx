import { projects } from "@/data";
import { OG_SIZE, OG_TYPE, renderOg } from "@/lib/og";

export const alt = "Дојрански Рај — Јавор Шпед";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  const project = projects.find((p) => p.id === "dojranski-raj");
  return renderOg({
    label: "Јавор Шпед · Exclusive Building",
    title: project?.name ?? "Дојрански Рај",
    subtitle: project?.tagline ?? project?.location,
    photo: project?.heroImage.src,
  });
}
