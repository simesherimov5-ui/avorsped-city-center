import { BuildingMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/**
 * What stands where a project has no photo yet: the Еспресо surface with our logo mark at 18%. No text, no hatching.
 * Fills its parent (give the parent a size).
 */
export function NoPhoto({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex h-full w-full items-center justify-center bg-espresso", className)}>
      <BuildingMark className="text-on-chrome" style={{ height: 80, width: "auto", opacity: 0.18 }} />
    </div>
  );
}
