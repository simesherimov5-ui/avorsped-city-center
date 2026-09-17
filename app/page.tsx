import Link from "next/link";
import { Building2, ShieldCheck, Sparkles, Landmark, Ruler, MapPin } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Masterplan } from "@/components/Masterplan";
import { ProjectCard } from "@/components/ProjectCard";
import { StatusLegend } from "@/components/ui/StatusBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Media } from "@/components/ui/Media";
import { Button } from "@/components/ui/Button";
import { development, projects, companyStats, availabilityCounts, apartments } from "@/data";

const WHY_US = [
  { icon: ShieldCheck, title: "30 години искуство", desc: "Секој завршен проект е испорачан во ветениот рок." },
  { icon: Building2, title: "Квалитетна градба", desc: "Строга контрола на квалитет во секоја фаза на градбата." },
  { icon: Sparkles, title: "Современа архитектура", desc: "Современ дизајн, никогаш типско решение." },
  { icon: Ruler, title: "Премиум материјали", desc: "Издржливи завршни работи со висока спецификација." },
  { icon: MapPin, title: "Стратешки локации", desc: "Локации избрани поради транспорт, училишта и пристап до градот." },
  { icon: Landmark, title: "Внимание на деталите", desc: "Од пропорцијата на фасадата до изборот на арматура." },
];

export default function HomePage() {
  const counts = availabilityCounts(apartments.filter((a) => a.buildingId));

  return (
    <>
      <Hero />

      {/* Company introduction */}
      <section className="bg-silver py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Кои сме ние"
              title="Три децении градба, поддржани од диверзифицирана групација."
              description="Exclusive Building, огранокот за недвижности на Јавор Шпед, проектира и гради станбени згради низ Северна Македонија — комбинирајќи современа архитектура, издржлива градба и транспарентен процес на продажба. Не градиме само станови; градиме соседства во кои луѓето сакаат да живеат."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8">
              <Button href="/about" variant="secondary">За компанијата</Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured development */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Тековни проекти" title={development.name} />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">
              <Media image={development.heroImage} className="aspect-[4/3]" />
              <div>
                <p className="text-ink/70 leading-relaxed">{development.description}</p>
                <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
                  <Stat label="Локација" value={development.location.split(",")[0]} />
                  <Stat label="Згради" value={String(development.buildings.length)} />
                  <Stat label="Станови" value={String(development.totalApartments)} />
                  <Stat label="Достапни сега" value={String(counts.available)} />
                  <Stat label="Завршување" value={development.expectedCompletion} />
                </dl>
                <div className="mt-8">
                  <Button href="/development" variant="primary">Истражи го проектот</Button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Interactive masterplan preview */}
      <section className="bg-charcoal py-24 text-warm-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading
              tone="dark"
              align="center"
              eyebrow="Шест згради, една адреса"
              title="Истражи ја ситуацијата"
              description="Задржете го покажувачот над зграда за преглед, или кликнете за да ги видите нејзините катови и станови."
            />
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-14">
              <Masterplan variant="preview" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Projects */}
      <section className="bg-warm-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Нашето портфолио" title="Завршени и претстојни проекти" />
              <Link href="/projects" className="focus-ring text-sm text-accent hover:underline">
                Погледни ги сите проекти →
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Зошто нас" title="Изградени на искуство, не на кратенки." align="center" />
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="flex flex-col gap-3 border-t border-line pt-5">
                  <item.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  <div className="font-display text-lg">{item.title}</div>
                  <p className="text-sm text-ink/60">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="mt-14 grid grid-cols-2 gap-6 border-t border-line pt-10 sm:grid-cols-4">
              {companyStats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl text-accent">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-ink/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Location */}
      <section className="bg-warm-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Локација" title={development.location} />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <div className="aspect-[4/3] border border-line bg-cream">
                <iframe
                  title="Мапа со локација на проектот"
                  className="h-full w-full grayscale"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(development.mapQuery)}&output=embed`}
                />
              </div>
              <ul className="grid grid-cols-1 gap-4 self-start sm:grid-cols-2">
                {development.nearbyPoints.map((p) => (
                  <li key={p.name} className="border border-line px-4 py-3">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="mt-0.5 text-xs text-ink/50">{p.category} · {p.distance}</div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-charcoal py-28 text-center text-warm-white">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-3xl sm:text-4xl">Пронајди го твојот нов дом</h2>
          <div className="mt-6 flex justify-center">
            <StatusLegend className="text-warm-white/70 [&_span]:text-warm-white/70" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/apartments" variant="primary">Разгледај станови</Button>
            <Button href="/consultation" variant="secondary" tone="dark">Закажи консултација</Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-2xl">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-ink/50">{label}</div>
    </div>
  );
}
