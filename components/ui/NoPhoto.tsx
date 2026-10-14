import { BuildingMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

/**
 * What stands where a project has no photo yet: the Еспресо surface with a Бронза line drawing of a building. No text, no hatching.
 * Fills its parent (give the parent a size).
 */
export function NoPhoto({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex h-full w-full items-center justify-center bg-espresso", className)}>
      <BuildingMark className="text-bronze" style={{ height: 96, width: "auto", opacity: 0.9 }} />
    </div>
  );
}
