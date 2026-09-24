import type { Metadata } from "next";
import { companyInfo, companyStats, projects } from "@/data";
import { Media } from "@/components/ui/Media";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

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
        <SectionHeading eyebrow="Нашата приказна" title="Три децении на Јавор Шпед." />
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-center">
          <Media image={BRAND_IMAGE} className="aspect-[4/3]" />
          <p className="leading-relaxed text-ink/70">{companyInfo.story}</p>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="eyebrow text-accent">Мисија</div>
              <p className="mt-3 font-display text-2xl leading-snug">{companyInfo.mission}</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              {companyStats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl text-accent">{s.value}</div>
                  <div className="eyebrow mt-1 text-ink/50">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <SectionHeading eyebrow="Нашите вредности" title="За што се залагаме" />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {companyInfo.values.map((v) => (
            <div key={v.title} className="border-t border-line pt-4">
              <div className="font-display text-lg">{v.title}</div>
              <p className="mt-2 text-sm text-ink/60">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
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
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <SectionHeading eyebrow="Портфолио" title={`${projects.filter((p) => p.status === "completed").length} завршени проекти`} />
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-ink/60">
            {projects
              .filter((p) => p.status === "completed")
              .map((p) => (
                <span key={p.id} className="border border-line px-3 py-1.5">
                  {p.name} · {p.year}
                </span>
              ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-20 text-center text-warm-white">
        <h2 className="font-display text-3xl">Сакате да дознаете повеќе?</h2>
        <div className="mt-8">
          <Button href="/contact" variant="primary">Контактирајте нè</Button>
        </div>
      </section>
    </div>
  );
}
