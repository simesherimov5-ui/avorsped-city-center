"use client";

import { useState } from "react";
import { Maximize2, RotateCw, Sofa, ChefHat, BedDouble, Bath, Trees } from "lucide-react";
import { Placeholder } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";

const HOTSPOTS = [
  { key: "living", label: "Дневна соба", icon: Sofa },
  { key: "kitchen", label: "Кујна", icon: ChefHat },
  { key: "bedroom", label: "Спална соба", icon: BedDouble },
  { key: "bathroom", label: "Бања", icon: Bath },
  { key: "terrace", label: "Тераса", icon: Trees },
];

/**
 * No real 360°/3D asset exists yet for this unit. This is a labeled, functional
 * placeholder that demonstrates the intended interaction (room hotspots, rotate,
 * fullscreen) — swap the Placeholder for a real panorama/GLB viewer (e.g. a
 * Matterport embed or react-three-fiber scene) once assets are delivered.
 */
export function ApartmentTour({ hasTour }: { hasTour: boolean }) {
  const [room, setRoom] = useState("living");

  if (!hasTour) {
    return (
      <div className="border border-dashed border-concrete bg-cream p-8 text-center">
        <p className="text-sm text-ink/60">
          Сè уште нема снимено 360° внатрешна тура за овој стан. Штом стане достапна, ќе се
          прикаже автоматски овде.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-chrome">
      <div className="relative aspect-video">
        <Placeholder
          label={`360° приказ (placeholder) — ${HOTSPOTS.find((h) => h.key === room)?.label}`}
          tone="dark"
          className="absolute inset-0"
        />
        <button
          className="focus-ring absolute right-4 top-4 flex items-center gap-1.5 border border-on-chrome/30 px-3 py-1.5 text-xs text-on-chrome hover:bg-on-chrome/10"
          aria-label="Цел екран"
        >
          <Maximize2 className="h-3.5 w-3.5" /> Цел екран
        </button>
        <button
          className="focus-ring absolute left-4 top-4 flex items-center gap-1.5 border border-on-chrome/30 px-3 py-1.5 text-xs text-on-chrome hover:bg-on-chrome/10"
          aria-label="Ротирај поглед"
        >
          <RotateCw className="h-3.5 w-3.5" /> Ротирај
        </button>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-on-chrome/10 p-3">
        {HOTSPOTS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setRoom(key)}
            className={cn(
              "focus-ring flex items-center gap-1.5 border px-3 py-1.5 text-xs transition-colors",
              room === key
                ? "border-accent bg-accent/20 text-on-chrome"
                : "border-on-chrome/20 text-on-chrome/70 hover:border-on-chrome/40"
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
