"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// The pin: a thin gold outline and a solid gold dot (colours come from contact.css), with a ring that pulses
// around its base.
const PIN = `<span class="ct-pin-ring"></span><svg width="28" height="38" viewBox="0 0 28 38" fill="none" aria-hidden="true"><path d="M14 37C14 37 27 23.5 27 14A13 13 0 1 0 1 14C1 23.5 14 37 14 37Z"/><circle cx="14" cy="14" r="4"/></svg>`;

// The map's dark tiles. CARTO's "Dark Matter" now answers "API KEY REQUIRED" without a key, so this uses Esri's
// dark gray basemap, which needs none. TODO(client): before launch pick a provider whose terms cover a company
// website and, if it needs a key (CARTO, MapTiler, Stadia), swap URL, attribution and zoom here: this is the one place.
const TILES = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  attribution:
    'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  zoom: 16,
  maxNativeZoom: 16,
  maxZoom: 18,
};

/** The map itself (Leaflet on dark tiles). Loaded only in the browser, and only when it is near. */
export default function ContactMap({ lat, lng }: { lat: number; lng: number }) {
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = node.current;
    if (!el) return;
    // Wheel zoom is off, and on touch screens one finger scrolls the page (two fingers still pinch to zoom).
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const map = L.map(el, { center: [lat, lng], zoom: TILES.zoom, scrollWheelZoom: false, dragging: !touch });
    // Leaflet's own "Leaflet" prefix carries a blue-and-yellow flag, which is outside the site's colours; the tile
    // and data credits stay.
    map.attributionControl.setPrefix(false);
    L.tileLayer(TILES.url, {
      attribution: TILES.attribution,
      maxNativeZoom: TILES.maxNativeZoom,
      maxZoom: TILES.maxZoom,
    }).addTo(map);
    L.marker([lat, lng], {
      icon: L.divIcon({ className: "ct-pin", html: PIN, iconSize: [28, 38], iconAnchor: [14, 38] }),
      keyboard: false,
      interactive: false,
    }).addTo(map);
    return () => {
      map.remove();
    };
  }, [lat, lng]);

  return <div ref={node} />;
}
