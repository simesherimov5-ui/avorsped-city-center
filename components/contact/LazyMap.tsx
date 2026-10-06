"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Leaflet only touches the browser, so the map is never rendered on the server.
const ContactMap = dynamic(() => import("./ContactMap"), { ssr: false });

/** Reserves the 300px box and loads the map only once it is about to scroll into view. */
export function LazyMap({ lat, lng }: { lat: number; lng: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="ct-map" role="region" aria-label="Мапа со локација">
      {near && <ContactMap lat={lat} lng={lng} />}
    </div>
  );
}
