import Link from "next/link";
import { Building2, ShieldCheck, Sparkles, Landmark, Ruler, MapPin, ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Masterplan } from "@/components/Masterplan";
import { ProjectShowcase } from "@/components/ProjectShowcase";
import { Media } from "@/components/ui/Media";
import { StatusLegend, DOT_COLOR } from "@/components/ui/StatusBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { development, projects, companyStats, companyInfo, apartments, availabilityCounts } from "@/data";

const cityCenter = projects.find((p) => p.id === "city-center")!;

const HIGHLIGHTS = [
  {
    title: "30 години искуство",
    quote: "Секој проект го градиме со истата посветеност како да е нашиот прв.",
    href: "/about",
  },
  {
    title: "Квалитет",
    quote: "Не прифаќаме кратенки — секој детал поминува низ строга контрола пред да биде завршен.",
    href: "/development",
  },
  {
    title: "Доверба",
    quote: "Транспарентен процес на продажба, од првиот разговор до предавањето на клучевите.",
    href: "/contact",
  },
];

const WHY_US = [
  { icon: ShieldCheck, title: "30 години искуство", desc: "Секој завршен проект е испорачан во ветениот рок." },
  { icon: Building2, title: "Квалитетна градба", desc: "Строга контрола на квалитет во секоја фаза на градбата." },
  { icon: Sparkles, title: "Современа архитектура", desc: "Современ дизајн, никогаш типско решение." },
  { icon: Ruler, title: "Премиум материјали", desc: "Издржливи завршни работи со висока спецификација." },
  { icon: MapPin, title: "Стратешки локации", desc: "Локации избрани поради транспорт, училишта и пристап до градот." },
  { icon: Landmark, title: "Внимание на деталите", desc: "Од пропорцијата на фасадата до изборот на арматура." },
];

const COURTYARD_IMAGE = { src: "/images/site/courtyard.jpg", alt: "City Center — пејзажиран двор", isPlaceholder: false };
const CENTRAL_AREA_IMAGE = { src: "/images/site/central-area.jpg", alt: "City Center — централна зона", isPlaceholder: false };
const CTA_IMAGE = { src: "/images/exteriors/exterior-01-dusk.jpg", alt: "City Center — вечерна визуелизација", isPlaceholder: false };

const LIVING_POINTS = [
  { label: "Двор", text: "Заеднички пејзажиран двор во срцето на комплексот." },
  { label: "Локација", text: cityCenter.distanceHighlights?.join(" · ") ?? "" },
  { label: "Архитектура", text: "Современ дизајн, никогаш типско решение." },
  { label: "Опкружување", text: "Локации избрани поради транспорт, училишта и пристап до градот." },
];

export default function HomePage() {
  const counts = availabilityCounts(apartments);
  const availablePct = Math.round((counts.available / counts.total) * 100);
  const reservedPct = Math.round((counts.reserved / counts.total) * 100);
  const soldPct = 100 - availablePct - reservedPct;
  const currentStageKey = development.constructionStages.find((s) => s.percentComplete < 100)?.key;

  return (
    <>
      {/* 1. Hero */}
      <Hero />

      {/* 2. Project introduction — editorial statement paired with the core facts */}
      <section className="bg-warm-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
            <Reveal>
              <div className="eyebrow text-accent">За проектот</div>
              <p className="mt-6 font-display text-3xl leading-snug text-charcoal sm:text-4xl lg:text-[2.75rem]">
                {development.description}
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-line pt-8 lg:border-t-0 lg:border-l lg:pl-14 lg:pt-0">
                <Fact value="6" label="Згради" />
                <Fact value={String(development.totalApartments)} label="Станови" />
                <Fact value="Струмица" label="Локација" />
                <Fact value={development.expectedCompletion} label="Завршување" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. Masterplan — major interactive section */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading
              eyebrow="Ситуационен план"
              title="Шест згради, организирани околу заеднички двор"
              description="Изберете зграда за да ги видите катовите, достапноста и тековната фаза на изградба."
              align="center"
            />
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-16">
              <Masterplan variant="full" className="max-w-6xl" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. Living experience — courtyard, location, architecture, environment */}
      <section className="bg-charcoal py-24 text-warm-white sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
            <Reveal>
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-3">
                  <Media image={COURTYARD_IMAGE} tone="dark" className="aspect-[4/5]" />
                </div>
                <div className="col-span-2 mt-12">
                  <Media image={CENTRAL_AREA_IMAGE} tone="dark" className="aspect-square" />
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div>
                <div className="eyebrow text-accent-soft">Живот во City Center</div>
                <h2 className="mt-4 font-display text-3xl sm:text-4xl">
                  Комплекс граден околу заеднички двор, не околу паркинг.
                </h2>
                <ul className="mt-10 space-y-6 border-t border-warm-white/15 pt-8">
                  {LIVING_POINTS.map((point) => (
                    <li key={point.label} className="flex gap-6">
                      <span className="eyebrow w-24 shrink-0 pt-0.5 text-warm-white/40">{point.label}</span>
                      <span className="text-warm-white/80">{point.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. Availability — a natural, numbers-led transition into the apartment finder */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div>
                <div className="eyebrow text-accent">Достапност во реално време</div>
                <h2 className="mt-4 font-display text-5xl text-charcoal sm:text-6xl">
                  {counts.available}<span className="text-ink/30"> / {counts.total}</span>
                </h2>
                <p className="mt-3 max-w-sm text-lg text-ink/70">
                  станови сè уште се достапни низ сите шест згради.
                </p>
                <div className="mt-8">
                  <Button href="/apartments" variant="primary">Разгледај станови</Button>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div>
                <div className="flex h-1.5 w-full overflow-hidden bg-line">
                  <div style={{ width: `${availablePct}%` }} className={DOT_COLOR.available} />
                  <div style={{ width: `${reservedPct}%` }} className={DOT_COLOR.reserved} />
                  <div style={{ width: `${soldPct}%` }} className={DOT_COLOR.sold} />
                </div>
                <StatusLegend className="mt-6" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. Construction progress — an editorial story, not a progress-bar widget */}
      <section className="bg-warm-white py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Напредок" title="Патот до предавање на клучевите" align="center" />
          </Reveal>
          <div className="relative mt-16">
            <div className="absolute bottom-2 left-[7px] top-2 w-px bg-line" aria-hidden />
            {development.constructionStages.map((stage, i) => {
              const isCurrent = stage.key === currentStageKey;
              return (
                <Reveal key={stage.key} delay={i * 0.05}>
                  <div className="relative flex gap-6 pb-12 last:pb-0">
                    <div className="relative z-10 mt-1.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                      <span
                        className={cn(
                          "h-3.5 w-3.5 rounded-full border-2",
                          stage.percentComplete === 100
                            ? "border-accent bg-accent"
                            : isCurrent
                              ? "border-accent bg-warm-white"
                              : "border-line bg-warm-white"
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3 className="font-display text-xl sm:text-2xl">{stage.label}</h3>
                        <span className="eyebrow text-ink/40">{stage.date}</span>
                      </div>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/60">{stage.description}</p>
                      {isCurrent && (
                        <span className="eyebrow mt-3 inline-block text-accent">
                          Тековна фаза · {stage.percentComplete}%
                        </span>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Portfolio — the wider body of work */}
      <section className="bg-charcoal py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Нашето портфолио" title="Портфолио на проекти" tone="dark" />
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-7xl px-6 lg:px-10">
            <ProjectShowcase projects={projects} />
          </div>
        </Reveal>
      </section>

      {/* 8. Trust — short editorial quotes */}
      <section className="bg-warm-white py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 sm:grid-cols-3 sm:divide-x sm:divide-line">
            {HIGHLIGHTS.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
                  <h3 className="inline-block border-b-2 border-accent pb-2 font-display text-2xl sm:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-ink/60">{item.quote}</p>
                  <Link
                    href={item.href}
                    aria-label={item.title}
                    className="focus-ring mt-7 flex h-9 w-9 items-center justify-center rounded-full border border-accent text-accent transition-colors hover:bg-accent hover:text-charcoal"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Why us + company stats */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionHeading eyebrow="Зошто нас" title="Изградени на искуство, не на кратенки." align="center" />
          </Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="flex flex-col gap-3.5 border-t border-line pt-6">
                  <item.icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  <div className="font-display text-xl">{item.title}</div>
                  <p className="text-sm leading-relaxed text-ink/60">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 sm:grid-cols-4 sm:divide-x sm:divide-line">
              {companyStats.map((stat, i) => (
                <div key={stat.label} className={i > 0 ? "sm:pl-8" : undefined}>
                  <div className="font-display text-4xl text-accent sm:text-5xl">
                    <CountUp value={stat.value} />
                  </div>
                  <div className="eyebrow mt-2 text-ink/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10. Final CTA — the last step before contacting sales */}
      <section className="relative overflow-hidden bg-charcoal py-28 text-center text-warm-white sm:py-36">
        <div className="absolute inset-0">
          <Media image={CTA_IMAGE} tone="dark" className="h-full w-full opacity-35" />
          <div className="absolute inset-0 bg-charcoal/70" />
        </div>
        <Reveal>
          <div className="relative mx-auto max-w-xl px-6">
            <div className="eyebrow text-accent-soft">Следен чекор</div>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">Закажи консултација</h2>
            <p className="mx-auto mt-5 max-w-md text-warm-white/70">
              Разговарајте со нашиот тим за продажба за City Center или за било кој друг наш проект.
            </p>
            <div className="mt-6 flex justify-center">
              <StatusLegend className="text-warm-white/70 [&_span]:text-warm-white/70" />
            </div>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Button href="/consultation" variant="primary">Закажи консултација</Button>
              <Button href="/apartments" variant="secondary" tone="dark">Разгледај станови</Button>
            </div>
            <div className="mt-8 text-sm text-warm-white/50">
              {companyInfo.phone} · {companyInfo.email}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-accent">{value}</div>
      <div className="eyebrow mt-2 text-ink/50">{label}</div>
    </div>
  );
}
