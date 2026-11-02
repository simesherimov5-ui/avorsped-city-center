import type { Metadata } from "next";
import { Masterplan } from "@/components/Masterplan";
import { Reveal } from "@/components/ui/Reveal";
import { GoogleMapPin } from "@/components/location-map/GoogleMapPin";
import { OtherProjects } from "@/components/OtherProjects";
import { ProjectMaterials } from "@/components/project/ProjectMaterials";
import { ProjectParking } from "@/components/project/ProjectParking";
import { ProjectLocation } from "@/components/project/ProjectLocation";
import { ProjectBuildProgress } from "@/components/project/ProjectBuildProgress";
import { ProjectBook } from "@/components/project/ProjectBook";
import { ProjectOpeningSection } from "@/components/project/ProjectOpeningSection";
import { ProjectNumbers } from "@/components/project/ProjectNumbers";
import { development, buildings, projects } from "@/data";
import { CITY_CENTER } from "@/lib/locations";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "City Center — станбен комплекс во Струмица",
  description: `City Center е станбен комплекс од ${buildings.length} згради во Струмица. Изберете зграда и кат и погледнете ги становите.`,
  path: "/development",
  image: null,
});

export default function DevelopmentPage() {
  const cityCenter = projects.find((p) => p.id === "city-center");
  // a project with `heroOpening` gets the cinematic opening instead of the plain header
  const opening = cityCenter?.heroOpening ? cityCenter : undefined;

  return (
    // Оникс is the page's base; the building picker is its one light block.
    <div className={opening ? undefined : "pt-24 sm:pt-28"}>
      {/* 1 · the cinematic opening, then «City Center во бројки», then 2 · "За проектот": they replace the plain header (the title and the intro text) */}
      {opening && (
        <ProjectOpeningSection
          project={opening}
          aboutTarget="izberete-zgrada"
          afterOpening={<ProjectNumbers project={opening} scrollTarget="izberete-zgrada" />}
        />
      )}
      {!opening && cityCenter && <ProjectNumbers project={cityCenter} scrollTarget="izberete-zgrada" />}

      {/* the light part of the page: the building picker */}
      <div className="on-light">
        {/* The plain header, for a project without the opening */}
        {!opening && (
          <section className="mx-auto max-w-7xl px-5 pb-12 pt-10 sm:px-8 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
              <Reveal immediate>
                <div className="eyebrow text-gold-deep">{development.location}</div>
                <h1 className="mt-3 font-display text-(length:--fs-h1) font-normal leading-[1.04] tracking-[-0.01em]">
                  {development.name}
                </h1>
              </Reveal>
              <Reveal immediate delay={0.08}>
                <p className="text-lead text-ink/70 lg:pb-1">{development.description}</p>
              </Reveal>
            </div>
          </section>
        )}

        {/* 3 · pick a building: the aerial photo with its markers and the compass; beside it only the facts of the chosen building */}
        <section id="izberete-zgrada" className="scroll-mt-(--nav-h) py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <Reveal>
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
                <div>
                  <div className="eyebrow text-gold-deep">КОМПЛЕКСОТ</div>
                  <h2 className="mt-3 text-balance font-display text-(length:--fs-h2) font-normal leading-[1.1] text-charcoal">
                    Изберете зграда.
                  </h2>
                </div>
                <p className="text-balance text-base leading-relaxed text-ink/65 lg:pb-1">
                  Кликнете на зграда за да ги видите нејзините катови и станови.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-12">
                <Masterplan
                  variant="full"
                  buildings={buildings}
                  image={development.masterplanImage}
                  hotspots={development.buildingHotspots}
                  basePath="/development"
                  north={cityCenter?.masterplanNorth}
                />
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {cityCenter && (
        <>
          {/* 4 · Материјали · 5 · Паркинг */}
          <ProjectMaterials project={cityCenter} />
          <ProjectParking project={cityCenter} />

          {/* 6 · Тек на градба · 7 · Локација · 8 · Закажете средба */}
          <ProjectBuildProgress project={cityCenter} />

          {/* 7 · Локација: the places near the complex (with their distances) and the map */}
          <ProjectLocation
            project={cityCenter}
            places={development.nearbyPoints.map((point) => ({ name: point.name, distance: point.distance }))}
            map={
              <>
                <GoogleMapPin
                  lat={CITY_CENTER.lat}
                  lng={CITY_CENTER.lng}
                  label={`Мапа: ${cityCenter.name}`}
                  className="!bg-sand min-[1040px]:aspect-auto min-[1040px]:min-h-[480px] min-[1040px]:flex-1"
                />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${CITY_CENTER.lat},${CITY_CENTER.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring mt-2 inline-flex min-h-11 w-fit items-center text-sm text-gold-deep underline decoration-gold decoration-2 underline-offset-4"
                >
                  Отвори во Google Maps
                </a>
              </>
            }
          />

          <ProjectBook project={cityCenter} scrollTarget="izberete-zgrada" />
        </>
      )}

      <OtherProjects currentProjectId="city-center" />
    </div>
  );
}
