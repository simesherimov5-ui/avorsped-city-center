import { Reveal } from "@/components/motion/Reveal";
import { ManifestText } from "@/components/home/ManifestText";

/**
 * "Во што веруваме": the company's manifest on a light surface: two sentences in the display serif, large and centred,
 * between the label and the signature. The sentences turn from grey to dark as the visitor scrolls (ManifestText).
 */
export function Manifest() {
  return (
    <section className="grain bg-cream text-charcoal">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-20 text-center sm:px-8 sm:py-28 lg:px-10">
        <Reveal>
          <div className="eyebrow text-gold-deep">Во што веруваме</div>
        </Reveal>
        <Reveal delay={0.1}>
          <ManifestText
            className="mx-auto max-w-[720px] text-balance font-display text-[clamp(24px,2.4vw,32px)] leading-[1.45]"
            text="Моментот кога првпат ќе го свртите клучот и ќе знаете дека сте дома. Тој момент го градиме веќе повеќе од 30 години."
          />
        </Reveal>
        <Reveal delay={0.2}>
          <div className="eyebrow text-gold-deep">— Javor Sped Holding</div>
        </Reveal>
      </div>
    </section>
  );
}
