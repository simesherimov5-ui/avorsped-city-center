import { Reveal } from "@/components/ui/Reveal";
import type { SplitTitle } from "@/types";

/**
 * «ЗА ПРОЕКТОТ» of a photo-led project page, on the cream page: on the left the heading (its end in Бронза) and a short
 * gold line under it; on the right the project's facts, one row each between thin lines, the label left and the value
 * right. One column on a phone, the heading first.
 */
export function ProjectIntroFacts({
  heading,
  facts,
}: {
  heading: SplitTitle;
  facts: { label: string; value: string }[];
}) {
  return (
    <section aria-label="За проектот" className="on-light grain">
      <div className="mx-auto grid max-w-[1320px] gap-14 px-[5%] pb-[72px] pt-[88px] md:grid-cols-[7fr_5fr] md:gap-[88px] md:pb-[120px] md:pt-[140px]">
        <Reveal>
          <div className="eyebrow tracking-[0.32em] text-gold-deep">ЗА ПРОЕКТОТ</div>
          <h2 className="m-0 mt-4 font-display text-[clamp(40px,4.8vw,72px)] font-normal leading-[1.05] text-ink">
            {heading.title}
            <span className="text-gold-deep">{heading.titleItalic}</span>
          </h2>
          <span aria-hidden className="mt-8 block h-px w-14 bg-gold" />
        </Reveal>
        <Reveal delay={0.1}>
          <dl className="m-0 border-t border-line">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-6 border-b border-line py-5">
                <dt className="text-label font-semibold uppercase tracking-[0.28em] text-gold-deep">{fact.label}</dt>
                <dd className="m-0 text-right font-display text-[28px] leading-tight text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
