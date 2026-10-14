import type { ElementType, ReactNode } from "react";
import { Reveal } from "./Reveal";

/** A section heading: it comes in with the site's one reveal (no line-by-line or word-by-word effect). */
export function RevealHeading({
  as = "h2",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Reveal as={as} className={className}>
      {children}
    </Reveal>
  );
}
