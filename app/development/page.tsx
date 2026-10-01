import type { Metadata } from "next";
import { Masterplan } from "@/components/Masterplan";
import { ConstructionTimeline } from "@/components/ConstructionTimeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { DOT_COLOR } from "@/components/ui/StatusBadge";
import { OtherProjects } from "@/components/OtherProjects";
import { cn } from "@/lib/cn";
import { development, availabilityCounts, apartments, buildings } from "@/data";

export const metadata: Metadata = {
  title: "Тековен проект — City Center",
  description: "Истражете го проектот City Center со шест згради: зданија, катови и достапност на станови.",
};

export default function DevelopmentPage() {
  const counts = availabilityCounts(apartments);
  const availablePct = Math.round((counts.available / counts.total) * 100);
  const reservedPct = Math.round((counts.reserved / counts.total) * 100);
  const soldPct = 100 - availablePct - reservedPct;

  return (
    <div className="pt-28">
      {/* Header — title, editorial lead paragraph, numbers as design elements */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
          <Reveal>
            <div className="eyebrow text-gold-deep">{development.location}</div>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl">{development.name}</h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-lead text-ink/70 lg:pb-1">{development.description}</p>
          </Reveal>
        </div>

        <Reveal delay={0.16}>
          <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 sm:grid-cols-4 sm:divide-x sm:divide-line">
            <Stat label="Згради" value="6" />
            <Stat label="Станови" value={String(development.totalApartments)} className="sm:pl-8" />
            <Stat label="Достапни" value={String(counts.available)} className="sm:pl-8" />
            <Stat label="Завршување" value={development.expectedCompletion} className="sm:pl-8" />
          </div>
        </Reveal>
      </section>

      {/* Masterplan — six buildings around a shared courtyard */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Ситуационен план"
              title="Шест згради, еден заеднички двор"
              description="Комплексот е распореден околу централен пејзажиран двор — секоја зграда гледа кон зеленило наместо кон паркинг или улица."
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

      {/* Availability — real-time breakdown across all six buildings */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <div className="eyebrow text-gold-deep">Достапност</div>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl">
                {counts.available} од {counts.total} станови сè уште се достапни
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60">
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
                <MeterLabel color={DOT_COLOR.available} label="Достапни" value={counts.available} />
                <MeterLabel color={DOT_COLOR.reserved} label="Резервирани" value={counts.reserved} />
                <MeterLabel color={DOT_COLOR.sold} label="Продадени" value={counts.sold} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Construction progress */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Напредок" title="Тек на изградба" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-14">
              <ConstructionTimeline stages={development.constructionStages} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Location */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <div className="eyebrow text-gold-deep">Локација</div>
              <h2 className="mt-4 font-display text-3xl">{development.location}</h2>
              <ul className="mt-8 space-y-4">
                {development.nearbyPoints.map((point) => (
                  <li
                    key={point.name}
                    className="flex items-baseline justify-between gap-4 border-b border-line pb-3 text-sm"
                  >
                    <span>
                      <span className="text-charcoal">{point.name}</span>
                      <span className="ml-2 text-ink/40">· {point.category}</span>
                    </span>
                    <span className="shrink-0 text-ink/50">{point.distance}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="aspect-[4/3] border border-line lg:aspect-auto lg:h-full">
              <iframe
                title="Мапа со локација на City Center"
                className="h-full w-full grayscale"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(development.mapQuery)}&output=embed`}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-chrome py-20 text-center text-on-chrome">
        <h2 className="font-display text-3xl">Не сте сигурни која зграда?</h2>
        <p className="mx-auto mt-3 max-w-md text-on-chrome/70">
          Филтрирајте секој стан од сите шест згради по големина, буџет и достапност.
        </p>
        <div className="mt-8">
          <Button href="/apartments" variant="primary">
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
      <div className="font-display text-4xl text-gold-deep sm:text-5xl">
        <CountUp value={value} />
      </div>
      <div className="eyebrow mt-2 text-ink/50">{label}</div>
    </div>
  );
}

function MeterLabel({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-2 w-2 rounded-full", color)} aria-hidden />
      <span className="text-ink/60">{label}</span>
      <span className="font-medium text-charcoal">{value}</span>
    </div>
  );
}
