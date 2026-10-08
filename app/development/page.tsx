import type { Metadata } from "next";
import { Masterplan } from "@/components/Masterplan";
import { ConstructionProgress } from "@/components/construction/ConstructionProgress";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { LocationMap } from "@/components/location-map/LocationMap";
import { DOT_COLOR, StatusMarker } from "@/components/ui/StatusBadge";
import { OtherProjects } from "@/components/OtherProjects";
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

// City Center on the map: the coordinates are in lib/locations.ts, and the spots are where
// each nearby place sits on the 400 × 300 drawing (the pin is at 200, 140), placed from the same map. A place that is
// not listed here is left off the drawing; its distance comes from the data.
const PLACE_SPOTS: Record<string, { x: number; y: number; side: "left" | "right" }> = {
  "Автопат А4": { x: 290, y: 78, side: "left" },
  "Бела Река": { x: 330, y: 168, side: "left" },
  "Стадион Младост": { x: 118, y: 226, side: "left" },
  "Спортска сала Парк": { x: 170, y: 272, side: "left" },
};

// The location in the company's own words.
const LOCATION_TEXT = {
  title: "Исклучителна локација — блиску до сè што ви е важно",
  paragraphs: [
    "Вистинската локација му дава поинаков ритам на секојдневието — повеќе време за себе и за најблиските, помалку време во движење и слобода да уживате во градот. Сместен во атрактивен дел од градот, надвор од најголемиот метеж, станбениот комплекс City ја обединува удобноста на мирното живеење со близината на сите важни содржини.",
    "Градскиот парк, супермаркетите, спортските игралишта, болницата и градинката се во непосредна близина, а развиената инфраструктура и директниот пристап до булеварите овозможуваат едноставно поврзување со останатите делови на градот. Така, секојдневните обврски стануваат полесни, а можностите за одмор и рекреација — поблиски.",
    "Внимателната поставеност и ориентација на комплексот, природното проветрување и широките, непречени погледи дополнително го збогатуваат квалитетот на живеењето. Сето тоа создава простор во кој поврзаноста со градот и чувството на спокој се во природна рамнотежа.",
  ],
};

export default function DevelopmentPage() {
  const cityCenter = projects.find((p) => p.id === "city-center");
  const counts = availabilityCounts(apartments);
  const availablePct = Math.round((counts.available / counts.total) * 100);
  const reservedPct = Math.round((counts.reserved / counts.total) * 100);
  const soldPct = 100 - availablePct - reservedPct;

  return (
    <div className="pt-24 sm:pt-28">
      {/* Header — title, editorial lead paragraph, numbers as design elements */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-12 pt-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <Reveal immediate>
            <div className="eyebrow text-gold-deep">{development.location}</div>
            <h1 className="mt-3 font-display text-[clamp(34px,4.4vw,60px)] font-normal leading-[1.04] tracking-[-0.01em]">
              {development.name}
            </h1>
          </Reveal>
          <Reveal immediate delay={0.08}>
            <p className="text-lead text-ink/70 lg:pb-1">{development.description}</p>
          </Reveal>
        </div>

        <Reveal immediate delay={0.16}>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 sm:grid-cols-4 sm:divide-x sm:divide-line">
            <Stat label="Згради" value="6" />
            <Stat label="Станови" value={String(development.totalApartments)} className="sm:pl-8" />
            <Stat label="Достапни" value={String(counts.available)} className="sm:pl-8" />
            <Stat label="Завршување" value={development.expectedCompletion} className="sm:pl-8" />
          </div>
        </Reveal>
      </section>

      {/* Availability — real-time breakdown across all six buildings */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <div className="eyebrow text-gold-deep">Достапност</div>
              <h2 className="font-display text-[clamp(26px,2.8vw,40px)] font-normal leading-[1.1] mt-3">
                {counts.available} од {unitsText(counts.total)} {plural(counts.available, "е", "се")} сè уште{" "}
                {availableWord(counts.available)}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                Статусот на секој стан во сите шест згради се ажурира во реално време.
              </p>
              <div className="mt-8">
                <Button href="/apartments" variant="primary">
                  Пронајди го твојот стан
                </Button>
              </div>
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
      </section>

      {/* Location */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <div className="eyebrow text-gold-deep">Локација · {development.location}</div>
              <h2 className="font-display text-[clamp(26px,2.8vw,40px)] font-normal leading-[1.1] mt-3">
                {LOCATION_TEXT.title}
              </h2>
              <div className="mt-6 max-w-[62ch] space-y-4 text-base leading-[1.75] text-ink/80">
                {LOCATION_TEXT.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
              <ul className="mt-10 space-y-4">
                {development.nearbyPoints.map((point) => (
                  <li
                    key={point.name}
                    className="flex items-baseline justify-between gap-4 border-b border-line pb-3 text-sm"
                  >
                    <span>
                      <span className="text-charcoal">{point.name}</span>
                      <span className="ml-2 text-muted">· {point.category}</span>
                    </span>
                    <span className="shrink-0 text-muted">{point.distance}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <LocationMap
                label="Мапа со локација на City Center"
                places={development.nearbyPoints.flatMap((point) => {
                  const spot = PLACE_SPOTS[point.name];
                  return spot ? [{ name: point.name, detail: point.distance, ...spot }] : [];
                })}
              />
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
          </Reveal>
        </div>
      </section>

      {/* Construction progress */}
      {cityCenter && (
        <section className="bg-cream py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
            <ConstructionProgress project={cityCenter} always />
          </div>
        </section>
      )}

      {/* Masterplan — six buildings around a shared courtyard */}
      <section className="bg-cream py-12 sm:py-16">
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
                apartments={apartments}
                image={development.masterplanImage}
                hotspots={development.buildingHotspots}
                basePath="/development"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-chrome py-12 sm:py-16 text-center text-on-chrome">
        <h2 className="font-display text-[clamp(26px,2.8vw,40px)] font-normal leading-[1.1]">
          Не сте сигурни која зграда?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-on-chrome/70">
          Филтрирајте секој стан од сите шест згради по големина, буџет и достапност.
        </p>
        <div className="mt-8">
          <Button href="/apartments" variant="primary" tone="dark">
            Пронајди го твојот стан
          </Button>
        </div>
      </section>

      <OtherProjects currentProjectId="city-center" />
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
