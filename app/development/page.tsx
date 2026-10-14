import type { Metadata } from "next";
import { Masterplan } from "@/components/Masterplan";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { GoogleMapPin } from "@/components/location-map/GoogleMapPin";
import { DOT_COLOR, StatusMarker } from "@/components/ui/StatusBadge";
import { OtherProjects } from "@/components/OtherProjects";
import { ProjectMaterials } from "@/components/project/ProjectMaterials";
import { ProjectParking } from "@/components/project/ProjectParking";
import { ProjectLocation } from "@/components/project/ProjectLocation";
import { ProjectBuildProgress } from "@/components/project/ProjectBuildProgress";
import { ProjectBook } from "@/components/project/ProjectBook";
import { ProjectOpeningSection } from "@/components/project/ProjectOpeningSection";
import { development, availabilityCounts, apartments, buildings, projects } from "@/data";
import { CITY_CENTER } from "@/lib/locations";
import { pageMetadata } from "@/lib/seo";
import type { UnitStatus } from "@/types";
import { availableWord, plural, unitsText } from "@/lib/plural";

export const metadata: Metadata = pageMetadata({
  title: "City Center — станбен комплекс во Струмица",
  description: `City Center е станбен комплекс од ${buildings.length} згради во Струмица. Изберете зграда и кат и погледнете ги ${availabilityCounts().available} ${availableWord(availabilityCounts().available)} ${plural(availabilityCounts().available, "стан", "станови")}.`,
  path: "/development",
  image: null,
});

export default function DevelopmentPage() {
  const cityCenter = projects.find((p) => p.id === "city-center");
  // a project with `heroOpening` gets the cinematic opening instead of the plain header
  const opening = cityCenter?.heroOpening ? cityCenter : undefined;
  // City Center's own page: its own apartments, not the whole holding's
  const ccApartments = apartments.filter((a) => a.projectId === "city-center");
  const counts = availabilityCounts(ccApartments);
  const availablePct = Math.round((counts.available / counts.total) * 100);
  const reservedPct = Math.round((counts.reserved / counts.total) * 100);
  const soldPct = 100 - availablePct - reservedPct;

  return (
    // Оникс is the page's base; the building picker is its one light block.
    <div className={opening ? undefined : "pt-24 sm:pt-28"}>
      {/* 1 · the cinematic opening and 2 · "За проектот" replace the plain header (the title and the intro text) */}
      {opening && <ProjectOpeningSection project={opening} />}

      {/* the light part of the page: the numbers and the building picker */}
      <div className="on-light">
        {/* The plain header, for a project without the opening; the numbers stay in both cases */}
        <section className="mx-auto max-w-7xl px-5 pb-12 pt-10 sm:px-8 lg:px-10">
          {!opening && (
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
          )}

          <Reveal immediate delay={0.16}>
            <div
              className={`${opening ? "" : "mt-10 "}grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 sm:grid-cols-4 sm:divide-x sm:divide-line`}
            >
              <Stat label="Згради" value="6" />
              <Stat label="Станови" value={String(development.totalApartments)} className="sm:pl-8" />
              <Stat label="Достапни" value={String(counts.available)} className="sm:pl-8" />
              <Stat label="Завршување" value={development.expectedCompletion} className="sm:pl-8" />
            </div>
          </Reveal>
        </section>

        {/* 3 · pick a building: the aerial photo with its markers and the compass; beside it only the facts of the chosen building */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <Reveal>
              <SectionHeading
                eyebrow="Ситуационен план"
                title="Шест згради, еден заеднички двор"
                description="Комплексот е распореден околу централен пејзажиран двор — секоја зграда гледа кон зеленило наместо кон паркинг или улица."
                size="compact"
                className="max-w-2xl"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-12">
                <Masterplan
                  variant="full"
                  buildings={buildings}
                  apartments={ccApartments}
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

      {/* Availability — real-time breakdown across all six buildings */}
      <section className="on-dark">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <div className="eyebrow text-gold-deep">Достапност</div>
                <h2 className="mt-3 font-display text-(length:--fs-h2) font-normal leading-[1.2]">
                  {counts.available} од {unitsText(counts.total)} {plural(counts.available, "е", "се")} сè уште{" "}
                  {availableWord(counts.available)}
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                  Статусот на секој стан во сите шест згради се ажурира во реално време.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div>
                <div className="flex h-1.5 w-full overflow-hidden bg-line">
                  <div style={{ width: `${availablePct}%` }} className={DOT_COLOR.available} />
                  <div style={{ width: `${reservedPct}%` }} className={DOT_COLOR.reserved} />
                  <div style={{ width: `${soldPct}%` }} className={DOT_COLOR.sold} />
                </div>
                <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                  <MeterLabel status="available" label="Достапни" value={counts.available} />
                  <MeterLabel status="reserved" label="Резервирани" value={counts.reserved} />
                  <MeterLabel status="sold" label="Продадени" value={counts.sold} />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {cityCenter && (
        <>
          {/* 4 · Материјали · 5 · Паркинг */}
          <ProjectMaterials project={cityCenter} />
          <ProjectParking project={cityCenter} />

          {/* 6 · Локација: the walking list and the map; the text about the place stays under them */}
          <ProjectLocation
            project={cityCenter}
            map={
              <div>
                <GoogleMapPin lat={CITY_CENTER.lat} lng={CITY_CENTER.lng} label={`Мапа: ${cityCenter.name}`} />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 text-sm">
                  <span className="text-muted">{development.mapQuery}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${CITY_CENTER.lat},${CITY_CENTER.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex min-h-11 items-center text-gold-deep underline underline-offset-4"
                  >
                    Отвори во Google Maps
                  </a>
                </div>
              </div>
            }
            below={
              <Reveal>
                <div className="mt-16 border-t border-line pt-12">
                  <ul className="list-none space-y-4 p-0">
                    {development.nearbyPoints.map((point) => (
                      <li
                        key={point.name}
                        className="flex items-baseline justify-between gap-4 border-b border-line pb-3 text-sm"
                      >
                        <span>
                          <span className="text-ink">{point.name}</span>
                          <span className="ml-2 text-muted">· {point.category}</span>
                        </span>
                        <span className="shrink-0 text-muted">{point.distance}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            }
          />

          {/* 7 · Тек на градба · 8 · Закажете средба */}
          <ProjectBuildProgress project={cityCenter} />
          <ProjectBook project={cityCenter} />
        </>
      )}

      <OtherProjects currentProjectId="city-center" light />
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="font-display text-3xl text-gold-deep sm:text-4xl">
        <CountUp value={value} />
      </div>
      <div className="eyebrow eyebrow-tight mt-2 text-muted">{label}</div>
    </div>
  );
}

function MeterLabel({ status, label, value }: { status: UnitStatus; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={status === "available" ? "text-gold-deep" : status === "reserved" ? "text-ink" : "text-muted"}>
        <StatusMarker status={status} />
      </span>
      <span className="text-muted">{label}</span>
      <span className="font-medium text-charcoal">{value}</span>
    </div>
  );
}
