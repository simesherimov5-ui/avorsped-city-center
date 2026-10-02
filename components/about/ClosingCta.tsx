import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { RevealHeading } from "@/components/motion/RevealHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow } from "@/components/black/Arrow";

/** The closing call to action: a darkened photo, one headline and one outline button to the Контакт page. */
export function ClosingCta({
  image,
  heading,
  label,
  href,
}: {
  image: { src: string; alt: string };
  heading: string;
  label: string;
  href: string;
}) {
  return (
    <section className="ab-cta">
      <div aria-hidden className="ab-cta-media">
        <Media
          image={{ ...image, alt: "", isPlaceholder: false }}
          tone="dark"
          sizes="100vw"
          className="h-full w-full"
        />
      </div>
      <div aria-hidden className="ab-cta-shade" />
      <RevealHeading as="h2" className="bk-serif" duration={1.1} ease="power4.out" from={115}>
        {heading}
      </RevealHeading>
      <Reveal>
        <Link href={href} className="bk-btn">
          {label}
          <Arrow />
        </Link>
      </Reveal>
    </section>
  );
}
