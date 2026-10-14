import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/motion/Reveal";

/**
 * "Три децении, во една минута": the company's film. Until the film exists the frame shows a still from the
 * project; pass `src` (the still then becomes its poster) when it does.
 * TODO(client): the one-minute film, 1994 to today, all projects (docs/content-needed.md).
 */
export function Film({ still, src }: { still: { src: string; alt: string }; src?: string }) {
  return (
    <section id="film" className="bg-chrome text-on-chrome">
      <div className="container-x section-y">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow text-accent">Филм</div>
              <h2 className="mt-3 font-display text-(length:--fs-h2) font-normal leading-[1.2]">
                Три децении, <em className="italic text-accent">во една минута.</em>
              </h2>
            </div>
            <p className="max-w-[340px] text-sm font-normal leading-[1.7] text-on-chrome/70">Од 1994 до денес.</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-espresso lg:mt-10 lg:aspect-auto lg:h-[480px]">
            {src ? (
              <video
                controls
                preload="none"
                poster={still.src}
                src={src}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <>
                <Media
                  image={{ ...still, isPlaceholder: false }}
                  tone="dark"
                  defer
                  sizes="(max-width: 1280px) 100vw, 1240px"
                  className="h-full w-full"
                />
                {/* a photo scrim: the still sits quietly behind the section, it is not the main picture yet */}
                <div aria-hidden className="absolute inset-0 bg-chrome/40" />
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
