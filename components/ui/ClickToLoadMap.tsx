"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  /** The map's address (the Google embed). Nothing is requested from it until the visitor asks for the map. */
  src: string;
  title: string;
  /** The place, written under the button. */
  place: string;
};

/**
 * An embedded map that waits for a click. Loading it right away pulls about 300 KB of script from Google (and sets
 * Google's cookies) for a visitor who may never look at the map, so it only loads once they press the button.
 */
export function ClickToLoadMap({ src, title, place }: Props) {
  const [shown, setShown] = useState(false);

  if (shown) return <iframe title={title} className="h-full w-full grayscale" src={src} />;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-warm-white p-6 text-center">
      <MapPin aria-hidden className="h-6 w-6 text-gold-deep" />
      <p className="max-w-xs text-sm text-muted">{place}</p>
      <Button variant="secondary" onClick={() => setShown(true)}>
        Прикажи мапа
      </Button>
      <p className="max-w-xs text-xs text-muted">Мапата ја дава Google и се вчитува кога ќе ја побарате.</p>
    </div>
  );
}
