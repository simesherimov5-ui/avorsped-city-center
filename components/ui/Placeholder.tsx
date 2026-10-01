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
            ? "bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_16px)]"
            : "bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.03)_0px,rgba(0,0,0,0.03)_1px,transparent_1px,transparent_16px)]"
        )}
      />
      <div
        className={cn(
          "relative flex flex-col items-center gap-2 px-4 text-center",
          isDark ? "text-on-chrome/50" : "text-ink/40"
        )}
      >
        <ImageOff className="h-5 w-5" strokeWidth={1.5} />
        <span className="text-[11px] uppercase tracking-[0.14em]">{label}</span>
      </div>
    </div>
  );
}
