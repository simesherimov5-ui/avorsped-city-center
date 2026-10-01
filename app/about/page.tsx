import type { Metadata } from "next";
import { companyInfo, companyStats, projects } from "@/data";
import { Media } from "@/components/ui/Media";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { ProjectCard } from "@/components/ProjectCard";

export const metadata: Metadata = {
  title: "За нас",
  description: "Дознајте повеќе за Јавор Шпед и Exclusive Building — нашата приказна, мисија, вредности и завршени проекти.",
};

const BRAND_IMAGE = {
  src: "/images/brand/holding-since-1994.jpg",
  alt: "Јавор Шпед, основан 1994",
  isPlaceholder: false,
};

export default function AboutPage() {
  return (
    <div className="pt-28">
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <Reveal>
          <SectionHeading eyebrow="Нашата приказна" title="Три децении на Јавор Шпед." />
        </Reveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <Media image={BRAND_IMAGE} className="aspect-[4/3]" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-lg text-lead leading-relaxed text-ink/70">{companyInfo.story}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <div>
                <div className="eyebrow text-gold-deep">Мисија</div>
                <p className="mt-3 max-w-md font-display text-2xl leading-snug">{companyInfo.mission}</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 sm:divide-x sm:divide-line">
                {companyStats.map((s, i) => (
                  <div key={s.label} className={i > 0 ? "sm:pl-6" : undefined}>
                    <div className="font-display text-4xl text-gold-deep">
                      <CountUp value={s.value} />
                    </div>
                    <div className="eyebrow mt-1.5 text-ink/50">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <Reveal>
          <SectionHeading eyebrow="Нашите вредности" title="За што се залагаме" />
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {companyInfo.values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <div className="border-t border-line pt-4">
                <div className="font-display text-lg">{v.title}</div>
                <p className="mt-2 text-sm text-ink/60">{v.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <Reveal>
          <SectionHeading eyebrow="Групацијата" title="Дел од Јавор Шпед" />
          <p className="mt-4 max-w-2xl text-sm text-ink/60">
            Exclusive Building работи заедно со овие компании во рамки на групацијата Јавор Шпед.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-ink/70">
            {companyInfo.groupCompanies.map((name) => (
              <span key={name} className="border border-line px-3 py-1.5">
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <Reveal>
          <SectionHeading eyebrow="Портфолио" title="Она што го градиме сега" />
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-chrome py-20 text-center text-on-chrome">
        <h2 className="font-display text-3xl">Сакате да дознаете повеќе?</h2>
        <div className="mt-8">
          <Button href="/contact" variant="primary">Контактирајте нè</Button>
        </div>
      </section>
    </div>
  );
}
