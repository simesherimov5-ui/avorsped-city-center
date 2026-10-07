import { Reveal } from "@/components/motion/Reveal";

/**
 * "Во што веруваме": the company's manifest on a light surface, set in the display serif, centred, one thought to a
 * line. The last line is italic Бронза (the accent on light).
 */
export function Manifest() {
  return (
    <section className="bg-cream text-charcoal">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-24 text-center sm:px-8 sm:py-36 lg:px-10">
        <Reveal>
          <div className="eyebrow text-gold-deep">Во што веруваме</div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="flex max-w-[980px] flex-col gap-1.5 font-display text-[clamp(24px,2.7vw,38px)] leading-[1.4]">
            <span>Има еден момент што никогаш не се заборава:</span>
            <span>кога за првпат ќе го свртите клучот</span>
            <span>и ќе сфатите дека сте дома.</span>
            <span>Тој момент го градиме веќе повеќе од тридесет години.</span>
            <span className="mt-4 italic text-gold-deep">Нашата работа е тој момент да трае цел живот.</span>
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="eyebrow text-gold-deep">— Javor Sped Holding</div>
        </Reveal>
      </div>
    </section>
  );
}
