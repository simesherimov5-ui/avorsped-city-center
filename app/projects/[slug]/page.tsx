import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { projects } from "@/data";
import { Media } from "@/components/ui/Media";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";
import { RoomVideoTour } from "@/components/RoomVideoTour";
import { StanbenaFloorPlan } from "@/components/StanbenaFloorPlan";
import { Button } from "@/components/ui/Button";
import { ConstructionTimeline } from "@/components/ConstructionTimeline";
import { development } from "@/data";

const VISTA_HEIGHTS_ROOM_TOUR = [
  {
    label: "Дневна соба",
    image: { src: "/images/stanbena-zgrada/dnevna-soba.jpg", alt: "Дневна соба", isPlaceholder: false },
    video: "/videos/stanbena-zgrada/dnevna-soba.mp4",
  },
  {
    label: "Кујна и трпезарија",
    image: { src: "/images/stanbena-zgrada/kujna.jpg", alt: "Кујна и трпезарија", isPlaceholder: false },
    video: "/videos/stanbena-zgrada/kujna.mp4",
  },
  {
    label: "Двор",
    image: { src: "/images/stanbena-zgrada/dvor.jpg", alt: "Двор", isPlaceholder: false },
    video: "/videos/stanbena-zgrada/dvor.mp4",
  },
];

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  return { title: project ? project.name : "Проект" };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-6xl px-6 pt-6 lg:px-10">
        <Link href="/projects" className="focus-ring inline-flex items-center gap-1 text-sm text-ink/50 hover:text-charcoal">
          <ChevronLeft className="h-4 w-4" /> Назад кон проектите
        </Link>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        {project.gallery.length > 0 ? (
          <PhotoCarousel
            photos={project.gallery}
            className={project.id === "vista-heights" ? "max-w-4xl" : undefined}
            fit={project.id === "vista-heights" ? "contain" : undefined}
          />
        ) : (
          <Media
            image={project.heroImage}
            label={`${project.name} - насловна визуелизација`}
            className="aspect-[16/7]"
            sizes="100vw"
          />
        )}
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="eyebrow text-accent">{project.location}</div>
            <h1 className="mt-1 font-display text-4xl">{project.name}</h1>
            <p className="mt-5 leading-relaxed text-ink/70">{project.description}</p>

            {project.id === "vista-heights" && (
              <div className="mt-12">
                <h2 className="font-display text-2xl">Видео разгледување на просториите</h2>
                <p className="mt-2 text-sm text-ink/60">Кликнете на просторија за да пуштите кратко видео разгледување.</p>
                <div className="mt-6">
                  <RoomVideoTour rooms={VISTA_HEIGHTS_ROOM_TOUR} />
                </div>
              </div>
            )}

            {project.id === "vista-heights" ? (
              <div className="mt-12">
                <h2 className="font-display text-2xl">Распоред на просториите</h2>
                <p className="mt-2 text-sm text-ink/60">Кликнете на број за да пуштите видео од таа просторија.</p>
                <div className="mt-6">
                  <StanbenaFloorPlan />
                </div>
              </div>
            ) : (
              project.apartmentTypes && (
                <div className="mt-12">
                  <h2 className="font-display text-2xl">Распоред на станови</h2>
                  <div className="mt-6 space-y-8">
                    {project.apartmentTypes.map((type) => (
                      <div key={type.label}>
                        <Media image={type.image} label={type.label} className="aspect-[16/11]" />
                        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-accent">{type.area}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {project.isFlagship && (
              <div className="mt-12">
                <h2 className="font-display text-2xl">Тек на изградба</h2>
                <div className="mt-6">
                  <ConstructionTimeline stages={development.constructionStages} />
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit space-y-6 border border-line bg-warm-white p-6">
            <div>
              <div className="eyebrow text-ink/40">Спецификации</div>
              <dl className="mt-4 space-y-3">
                {project.specifications.map((s) => (
                  <div key={s.label} className="flex justify-between border-b border-line pb-2 text-sm">
                    <dt className="text-ink/60">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {project.isFlagship && (
              <Button href="/development" variant="primary" className="w-full">
                Истражи го проектот
              </Button>
            )}
            <Button href="/contact" variant="secondary" className="w-full">
              Контактирај за овој проект
            </Button>
          </aside>
        </div>
      </section>
    </div>
  );
}
