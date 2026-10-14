import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { RevealHeading } from "@/components/motion/RevealHeading";

/**
 * A heading on the left and running text on the right (stacked on a phone). The first paragraph is set larger, as the
 * lead. `children` (optional) sit under both columns, across the full width, for example a list.
 */
export function Prose({
  heading,
  paragraphs,
  children,
}: {
  heading: string;
  paragraphs: string[];
  children?: ReactNode;
}) {
  const [lead, ...rest] = paragraphs;
  return (
    <>
      <div className="ab-prose">
        <RevealHeading as="h2" className="bk-h2 bk-serif" duration={1.1} ease="power4.out" from={115}>
          {heading}
        </RevealHeading>
        <Reveal>
          <div className="ab-prose-body">
            <p className="ab-prose-lead">{lead}</p>
            {rest.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </div>
      {children}
    </>
  );
}
