import { Fragment } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

type Props = {
  eyebrow: string;
  /** The big statement. */
  statement: string;
  /** A phrase inside the statement to set in gold italic. */
  gold?: string;
  /** Smaller paragraphs under the statement. */
  more?: string[];
};

/** Words of `text` with a flag on the ones that belong to the `gold` phrase. */
function tokenize(text: string, gold?: string) {
  const words = text.split(" ");
  const goldWords = gold?.split(" ") ?? [];
  const start = goldWords.length ? words.findIndex((_, i) => goldWords.every((g, k) => words[i + k] === g)) : -1;
  return words.map((word, i) => ({ word, gold: start >= 0 && i >= start && i < start + goldWords.length }));
}

/**
 * One big centred statement; the words of the `gold` phrase are set in Светол бакар. It comes in with the site's one
 * reveal, with no word-by-word effect.
 */
export function Story({ eyebrow, statement, gold, more = [] }: Props) {
  const words = tokenize(statement, gold);

  return (
    <section className="ab-story bk-wrap">
      <div className="ab-story-inner">
        <div className="bk-eyebrow is-center">{eyebrow}</div>
        <Reveal>
          <p className="ab-story-text">
            {words.map((w, i) => (
              <Fragment key={i}>
                <span className={cn(w.gold && "bk-gold-i")}>{w.word}</span>{" "}
              </Fragment>
            ))}
          </p>
        </Reveal>
        {more.length > 0 && (
          <Reveal>
            <div className="ab-story-rest">
              {more.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
