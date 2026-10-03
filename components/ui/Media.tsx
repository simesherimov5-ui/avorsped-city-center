import Image from "next/image";
import type { CSSProperties } from "react";
import { Placeholder } from "./Placeholder";
import { cn } from "@/lib/cn";
import type { ImageFocus } from "@/types";

// The soft fade at the edges of a shrunken picture: transparent at each edge, solid by 5% in.
const EDGE_FADE =
  "linear-gradient(to right, transparent, black 5%, black 95%, transparent), linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)";

interface MediaImage {
  src: string;
  alt: string;
  isPlaceholder: boolean;
}

/**
 * Renders a real image when one has been supplied, otherwise falls back to
 * the labeled Placeholder. This is the single seam where real project assets
 * replace mock data — swap `isPlaceholder: false` + a `src` in /data and the
 * UI picks it up everywhere automatically.
 */
export function Media({
  image,
  className,
  tone,
  label,
  priority,
  fit = "cover",
  focus,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  image: MediaImage;
  className?: string;
  tone?: "light" | "dark";
  label?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  /** A project's framing (zoom below 1 shows more of the photo, with a blurred copy behind it). */
  focus?: ImageFocus;
  sizes?: string;
}) {
  if (image.isPlaceholder || !image.src) {
    return <Placeholder label={label ?? image.alt} tone={tone} className={className} />;
  }

  // Further out than "fill the frame": the picture is drawn at `zoom` times the size it would have to cover the
  // frame, anchored on the focal point, so it can show more of the photo than a cover crop does. The frame's
  // uncovered edges are filled with a blurred, darkened copy of the same photo, and the picture's own edges fade
  // into it. The sizes use container units of the frame (this component's root), so no layout script is needed.
  const out = fit === "cover" && focus !== undefined && focus.zoom < 1;
  const aspect = focus?.aspect ?? 1.5;
  const picture: CSSProperties | undefined =
    out && focus
      ? ({
          "--w": `calc(${focus.zoom} * max(100cqw, 100cqh * ${aspect}))`,
          width: "var(--w)",
          height: `calc(var(--w) / ${aspect})`,
          left: `calc((100cqw - var(--w)) * ${focus.x / 100})`,
          top: `calc((100cqh - var(--w) / ${aspect}) * ${focus.y / 100})`,
          maskImage: EDGE_FADE,
          WebkitMaskImage: EDGE_FADE,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        } as CSSProperties)
      : undefined;
  // Zoomed in (above 1) or just re-centred: the same cover crop, around the focal point.
  const framing: CSSProperties | undefined =
    fit === "cover" && focus && !out
      ? {
          objectPosition: `${focus.x}% ${focus.y}%`,
          ...(focus.zoom > 1 ? { transform: `scale(${focus.zoom})`, transformOrigin: `${focus.x}% ${focus.y}%` } : {}),
        }
      : undefined;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        out && "[container-type:size]",
        fit === "contain" && (tone === "dark" ? "bg-chrome" : "bg-silver"),
        className
      )}
    >
      {out && (
        <div aria-hidden className="absolute inset-0 scale-[1.2] [filter:blur(40px)_brightness(0.55)]">
          <Image src={image.src} alt="" fill sizes="25vw" className="object-cover" quality={40} />
        </div>
      )}
      {out ? (
        <div className="absolute" style={picture}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            className="object-cover"
            priority={priority}
            quality={90}
          />
        </div>
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className={fit === "contain" ? "object-contain" : "object-cover"}
          style={framing}
          priority={priority}
          quality={90}
        />
      )}
    </div>
  );
}
