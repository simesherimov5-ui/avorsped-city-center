import Image from "next/image";
import type { CSSProperties } from "react";
import { Placeholder } from "./Placeholder";
import { cn } from "@/lib/cn";
import { isNarrowPhoto } from "@/lib/image-sizes";
import type { ImageFocus } from "@/types";

/** The quality every photo is requested at (also in next.config.ts → images.qualities). */
const QUALITY = 80;

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
  defer,
  fit = "cover",
  focus,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  crisp = false,
  wholeAlign = "center",
}: {
  image: MediaImage;
  className?: string;
  tone?: "light" | "dark";
  label?: string;
  priority?: boolean;
  /** A photo further down the page: it is fetched at low priority so it does not compete with the first photo. */
  defer?: boolean;
  fit?: "cover" | "contain";
  /** A project's framing: where the cover crop is centred and an optional zoom in. */
  focus?: ImageFocus;
  sizes?: string;
  /**
   * For lossless line drawings (plans, sketches): the file is served as it is, never resized or re-encoded, because
   * the optimizer's lossy re-encoding smears thin lines. The drawing must then not be shown larger than its own pixels.
   */
  crisp?: boolean;
  /**
   * A square or portrait photo in a wide frame is shown whole (see below); this is the side it sits on when the frame
   * is wide, e.g. "right" when the layout has text on the left.
   */
  wholeAlign?: "center" | "left" | "right";
}) {
  if (image.isPlaceholder || !image.src) {
    return <Placeholder label={label ?? image.alt} tone={tone} className={className} />;
  }

  // The first big photo of a page loads first and at once; every other one waits until it is near the screen.
  const loading = priority
    ? ({ loading: "eager", fetchPriority: "high" } as const)
    : ({ loading: "lazy", fetchPriority: defer ? "low" : undefined } as const);

  // A square or portrait photo (narrower than 1.2:1, e.g. the Станбена Куќа facade) that would cover a wide frame would
  // lose its top floor and roof. Where the frame is wider than about 1.25:1 it is shown whole, at its own proportions,
  // on the chosen side, and the rest of the frame is the same photo enlarged, blurred (40px) and darkened (Оникс 55%).
  // In a frame that is not wide (a phone, a tall card) it simply covers the frame. The switch is a container query on
  // the frame itself (.media-whole in globals.css), so it holds in any layout.
  if (!crisp && isNarrowPhoto(image.src)) {
    return (
      <div className={cn("media-whole relative overflow-hidden bg-espresso", className)} data-align={wholeAlign}>
        <Image
          src={image.src}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          className="media-whole__bg object-cover"
          quality={QUALITY}
          loading="lazy"
        />
        <div aria-hidden className="media-whole__shade" />
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="media-whole__photo"
          style={focus ? { objectPosition: `${focus.x}% ${focus.y}%` } : undefined}
          quality={QUALITY}
          {...loading}
        />
      </div>
    );
  }

  // Further out than "fill the frame": the picture is drawn at `zoom` times the size it would have to cover the
  // frame, anchored on the focal point, so it can show more of the photo than a cover crop does. The frame's
  // uncovered edges are filled with a blurred, darkened copy of the same photo, and the picture's own edges fade
  // into it. The sizes use container units of the frame (this component's root), so no layout script is needed.
  // Photos always fill their frame cleanly (object-cover): no zoomed-out picture over a blurred copy of itself.
  const out = false;
  // A photo shown whole in a frame of another shape ("contain", e.g. a portrait picture in a wide card) gets the same
  // treatment instead of flat bars: the picture sits in the middle with a blurred, darkened copy behind it.
  // Only a lossless line drawing (plan, sketch) is shown whole; it sits on its own surface.
  const contained = fit === "contain" && Boolean(crisp);
  const sizedPicture = out || (contained && focus?.aspect !== undefined);
  const aspect = focus?.aspect ?? 1.5;
  const fade = {
    maskImage: EDGE_FADE,
    WebkitMaskImage: EDGE_FADE,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
  const picture: CSSProperties | undefined =
    out && focus
      ? ({
          "--w": `calc(${focus.zoom} * max(100cqw, 100cqh * ${aspect}))`,
          width: "var(--w)",
          height: `calc(var(--w) / ${aspect})`,
          left: `calc((100cqw - var(--w)) * ${focus.x / 100})`,
          top: `calc((100cqh - var(--w) / ${aspect}) * ${focus.y / 100})`,
          ...fade,
        } as CSSProperties)
      : contained && focus?.aspect !== undefined
        ? ({
            "--w": `min(100cqw, 100cqh * ${aspect})`,
            width: "var(--w)",
            height: `calc(var(--w) / ${aspect})`,
            left: "calc((100cqw - var(--w)) / 2)",
            top: "calc((100cqh - var(--w) / " + aspect + ") / 2)",
            ...fade,
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
        "relative overflow-hidden bg-espresso",
        sizedPicture && "[container-type:size]",
        contained && (tone === "dark" ? "bg-chrome" : "bg-silver"),
        className
      )}
    >
      {sizedPicture ? (
        <div className="absolute" style={picture}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            className={contained ? "object-contain" : "object-cover"}
            quality={QUALITY}
            unoptimized={crisp}
            {...loading}
          />
        </div>
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className={contained ? "object-contain" : "object-cover"}
          style={framing}
          quality={QUALITY}
          unoptimized={crisp}
          {...loading}
        />
      )}
    </div>
  );
}
