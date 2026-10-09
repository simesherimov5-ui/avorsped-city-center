"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import JavorSpedIntro from "@/components/javor-sped-intro/JavorSpedIntro";

type IntroState = { ready: boolean; revealing: boolean; instant: boolean };
const SKIPPED: IntroState = { ready: true, revealing: true, instant: true };
const IntroContext = createContext<IntroState>(SKIPPED);

/**
 * `revealing` flips true the moment the black screen starts to open — the hero's text entrance and
 * the navbar start then, from a hidden state. `ready` flips true once the screen is gone. `instant`
 * is true when the intro never plays (a visit that does not start on the homepage; it plays on every load of it):
 * consumers snap straight to their final state.
 */
export function useIntro() {
  return useContext(IntroContext);
}

/**
 * Resolves once the hero photo that is actually on the page (the optimised `<img>` Next renders,
 * not the raw file) is loaded and decoded. Pages without a hero photo resolve immediately; a 10s
 * cap stops a failed image from holding the opening forever.
 */
function heroPhotoLoaded() {
  return new Promise<void>((resolve) => {
    const started = performance.now();
    const check = () => {
      const wrap = document.querySelector("[data-hero-image]");
      if (!wrap) return resolve();
      const img = wrap.querySelector("img");
      if (img && img.complete && img.naturalWidth > 0) {
        (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => resolve());
        return;
      }
      if (performance.now() - started > 10000) return resolve();
      setTimeout(check, 100);
    };
    check();
  });
}

export function IntroProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The opening belongs to the homepage only, and only to a visit that starts there.
  const [startedOnHome] = useState(pathname === "/");
  const [phase, setPhase] = useState<"intro" | "revealing" | "done">("intro");

  // Stable identities, so a parent re-render can never restart the sequence.
  const handleReveal = useCallback(() => setPhase((p) => (p === "intro" ? "revealing" : p)), []);
  const handleDone = useCallback(() => setPhase("done"), []);

  const skip = !startedOnHome;
  const state: IntroState = skip ? SKIPPED : { ready: phase === "done", revealing: phase !== "intro", instant: false };

  return (
    <IntroContext.Provider value={state}>
      {!skip && phase !== "done" && (
        <JavorSpedIntro onReveal={handleReveal} onDone={handleDone} waitFor={heroPhotoLoaded} />
      )}
      {children}
    </IntroContext.Provider>
  );
}
