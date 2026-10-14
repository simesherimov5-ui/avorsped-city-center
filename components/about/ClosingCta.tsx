import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { Media } from "@/components/ui/Media";
import { RevealHeading } from "@/components/motion/RevealHeading";
import { Reveal } from "@/components/motion/Reveal";
import { PrimaryFace } from "@/components/ui/Button";

/** The closing call to action: a darkened photo, one headline and one filling button to the Контакт page. */
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
          defer
          sizes="(max-width: 767px) 160vw, 100vw"
          className="h-full w-full"
        />
      </div>
      <div aria-hidden className="ab-cta-shade" />
      <div className="bk-wrap">
        <RevealHeading as="h2" className="bk-serif" duration={1.1} ease="power4.out" from={115}>
          {heading}
        </RevealHeading>
        <Reveal>
          <Link href={href} className="btn-primary" data-tone="dark">
            <PrimaryFace>{label}</PrimaryFace>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
