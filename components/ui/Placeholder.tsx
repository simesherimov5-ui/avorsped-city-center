import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";

interface PlaceholderProps {
  label: string;
  className?: string;
  tone?: "light" | "dark";
}

/**
 * Clearly-labeled stand-in for a real render/photo/3D asset.
 * Swap for a real <Image> once project assets exist — the label makes
 * every placeholder impossible to mistake for a finished asset.
 */
export function Placeholder({ label, className, tone = "light" }: PlaceholderProps) {
  const isDark = tone === "dark";
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        isDark ? "bg-chrome" : "bg-concrete/30",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--color-travertine)_4%,transparent)_0px,color-mix(in_srgb,var(--color-travertine)_4%,transparent)_1px,transparent_1px,transparent_16px)]"
            : "bg-[repeating-linear-gradient(135deg,color-mix(in_srgb,var(--color-onyx)_3%,transparent)_0px,color-mix(in_srgb,var(--color-onyx)_3%,transparent)_1px,transparent_1px,transparent_16px)]"
        )}
      />
      <div
        className={cn(
          "relative flex flex-col items-center gap-2 px-4 text-center",
          isDark ? "text-on-chrome/80" : "text-muted"
        )}
      >
        <ImageOff className="h-5 w-5" strokeWidth={1.5} />
        <span className="text-label uppercase tracking-label">{label}</span>
      </div>
    </div>
  );
}
