import { Media } from "@/components/ui/Media";
import { Logo } from "@/components/ui/Logo";

const HERO_IMAGE = {
  src: "/images/exteriors/exterior-03-day.jpg",
  alt: "City Center — насловна визуелизација",
  isPlaceholder: false,
};

export function Hero() {
  return (
    <section className="relative flex h-[100svh] min-h-[560px] items-center justify-center overflow-hidden bg-charcoal text-warm-white">
      <div className="absolute inset-0">
        <Media image={HERO_IMAGE} tone="dark" className="h-full w-full" priority sizes="100vw" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="absolute left-6 top-6 z-10 sm:left-10 sm:top-10">
        <Logo variant="inline" />
      </div>

      <div className="relative flex flex-col items-center px-6 text-center">
        <h1 className="font-display text-3xl tracking-tight sm:text-5xl">Добредојдовте во Javor Sped</h1>
        <p className="mt-3 text-lg text-warm-white/80 sm:text-xl">вашиот нов дом</p>
      </div>
    </section>
  );
}
