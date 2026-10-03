import { notFound } from "next/navigation";
import { projects } from "@/data";
import { OG_SIZE, OG_TYPE, renderOg } from "@/lib/og";

export const alt = "Проект — Јавор Шпед";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

// Only projects without a page of their own are served here (the others redirect to theirs).
export function generateStaticParams() {
  return projects.filter((p) => !p.href).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return renderOg({
    label: "Јавор Шпед · Exclusive Building",
    title: project.name,
    subtitle: project.tagline ?? project.location,
    photo: project.heroImage.src,
  });
}
