import { Reveal } from "@/components/motion/Reveal";

/**
 * "Во што веруваме": the company's manifest on Оникс, set in the display serif, centred, one thought to a line. The
 * last line is italic Светол бакар (the accent on dark).
 */
export function Manifest() {
  return (
    <section className="bg-chrome text-on-chrome">
      <div className="container-x section-y flex flex-col items-center gap-8 text-center">
        <Reveal>
          <div className="eyebrow text-accent">Во што веруваме</div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="flex max-w-[980px] flex-col gap-1.5 font-display text-[clamp(19px,2vw,28px)] leading-[1.45]">
            <span>Има еден момент што никогаш не се заборава:</span>
            <span>кога за првпат ќе го свртите клучот</span>
            <span>и ќе сфатите дека сте дома.</span>
            <span>Тој момент го градиме веќе повеќе од тридесет години.</span>
            <span className="mt-3 italic text-accent">Нашата работа е тој момент да трае цел живот.</span>
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="eyebrow text-accent">— Javor Sped Holding</div>
        </Reveal>
      </div>
    </section>
  );
}
