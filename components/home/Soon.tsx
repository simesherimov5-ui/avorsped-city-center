import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";

/** "Наскоро": a band that tells visitors something new is coming and sends them to the form to leave their details. */
export function Soon() {
  return (
    <section className="border-t border-on-chrome/10 bg-chrome text-on-chrome">
      <div className="container-x section-y flex flex-wrap items-center justify-between gap-10">
        <Reveal>
          <div className="max-w-2xl">
            <div className="eyebrow text-accent">Наскоро</div>
            <p className="mt-4 font-display text-(length:--fs-statement) leading-[1.15]">
              Нешто ново се подготвува. <em className="italic text-accent">Бидете први што ќе ги дознаете деталите.</em>
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <Button href="/contact" variant="primary" tone="dark">
            Пријави се
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
