import type { Metadata } from "next";
import { Masterplan } from "@/components/Masterplan";
import { ConstructionTimeline } from "@/components/ConstructionTimeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { development, availabilityCounts, apartments } from "@/data";

export const metadata: Metadata = {
  title: "Тековен проект — City Center",
  description: "Истражете го проектот City Center со шест згради: зданија, катови и достапност на станови.",
};

export default function DevelopmentPage() {
  const counts = availabilityCounts(apartments);

  return (
    <div className="pt-28">
      <section className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-10">
        <SectionHeading
          eyebrow={development.location}
          title={development.name}
          description={development.description}
          align="center"
        />
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Згради" value="6" />
          <Stat label="Станови" value={String(development.totalApartments)} />
          <Stat label="Достапни" value={String(counts.available)} />
          <Stat label="Завршување" value={development.expectedCompletion} />
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Masterplan variant="full" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 lg:px-10">
        <SectionHeading eyebrow="Напредок" title="Тек на изградба" />
        <div className="mt-12">
          <ConstructionTimeline stages={development.constructionStages} />
        </div>
      </section>

      <section className="bg-charcoal py-20 text-center text-warm-white">
        <h2 className="font-display text-3xl">Не сте сигурни која зграда?</h2>
        <p className="mx-auto mt-3 max-w-md text-warm-white/70">
          Филтрирајте секој стан од сите шест згради по големина, буџет и достапност.
        </p>
        <div className="mt-8">
          <Button href="/apartments" variant="primary">Пронајди го твојот стан</Button>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-accent">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-ink/50">{label}</div>
    </div>
  );
}
