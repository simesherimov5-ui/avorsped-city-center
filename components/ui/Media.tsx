import Image from "next/image";
import { Placeholder } from "./Placeholder";
import { cn } from "@/lib/cn";

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
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  image: MediaImage;
  className?: string;
  tone?: "light" | "dark";
  label?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  sizes?: string;
}) {
  if (image.isPlaceholder || !image.src) {
    return <Placeholder label={label ?? image.alt} tone={tone} className={className} />;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fit === "contain" && (tone === "dark" ? "bg-chrome" : "bg-silver"),
        className
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        className={fit === "contain" ? "object-contain" : "object-cover"}
        priority={priority}
        quality={priority ? 100 : 90}
      />
    </div>
  );
}
