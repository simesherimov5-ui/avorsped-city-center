import { ManifestStage } from "@/components/home/ManifestStage";
import { ManifestText } from "@/components/home/ManifestText";
import type { CSSProperties } from "react";

const TEXT =
  "Има еден момент што никогаш не се заборава: кога за првпат ќе го свртите клучот и ќе сфатите дека сте дома. Тој момент го градиме повеќе од триесет години. Нашата работа е тој момент да трае цел живот.";
const WORDS = TEXT.split(/\s+/).filter(Boolean).length;

/**
 * "Во што веруваме": the company's manifest on a light surface: three sentences in the brand voice (Cormorant Garamond,
 * .brand-voice in globals.css), large and centred, between the label and the signature. The sentences turn from grey to dark
 * as the visitor scrolls (ManifestText). When the section first comes into view it plays «Месинг во движење» once
 * (ManifestStage, .mf-stage in globals.css): the two Бронза quotation marks glide in from the sides with a line growing from
 * each toward the quote, the label fades in, every word rises out of its own line, a light sheen passes over the marks and the
 * signature comes last. The marks and the lines are decoration (aria-hidden); the quote is plain text, read once.
 */
export function Manifest() {
  return (
    <section className="brand-voice grain bg-cream text-charcoal">
      <ManifestStage
        className="mf-stage mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-20 text-center sm:px-8 sm:py-28 lg:px-10"
        style={{ "--n": WORDS } as CSSProperties}
      >
        <div className="mf-eyebrow eyebrow text-gold-deep">Во што веруваме</div>
        <div className="mf-quote mx-auto max-w-[720px]">
          <span aria-hidden className="mf-mark mf-mark--open">
            “
          </span>
          <span aria-hidden className="mf-rule mf-rule--open" />
          <ManifestText
            className="mx-auto max-w-[720px] text-balance font-display text-[length:calc(clamp(24px,2.4vw,32px)*var(--type-scale,1))] leading-[1.45]"
            text={TEXT}
          />
          <span aria-hidden className="mf-rule mf-rule--close" />
          <span aria-hidden className="mf-mark mf-mark--close">
            ”
          </span>
        </div>
        <div className="mf-sign eyebrow text-gold-deep">— JAVOR SPED HOLDING</div>
      </ManifestStage>
    </section>
  );
}
