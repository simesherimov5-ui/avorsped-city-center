"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Site-wide "spatial" page-to-page transition: a surface expands from the
 * point the visitor just interacted with (a building marker, a floor row, an
 * apartment region) to cover the screen, the route swaps underneath it, then
 * it reveals the destination once that page has mounted. This is the one
 * mechanism behind every "zoom deeper" and "step back" moment in the
 * Masterplan → Building → Floor → Apartment journey — no per-page bespoke
 * transition code, no experimental browser API, works on any Next.js version.
 */

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Phase = "idle" | "expand" | "reveal";

interface OverlayState {
  phase: Phase;
  origin: Rect | null;
  label?: string;
}

interface TransitionOverlayContextValue {
  /** Expands the overlay from `origin` (viewport px rect); resolves once fully covered. */
  trigger: (origin: Rect, label?: string) => Promise<void>;
  /** Starts the reveal (called by ZoomEnter once a destination page mounts). No-op if nothing is covering the screen. */
  clear: () => void;
}

const TransitionOverlayContext = createContext<TransitionOverlayContextValue | null>(null);

export function TransitionOverlayProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OverlayState>({ phase: "idle", origin: null });
  const reduceMotion = useReducedMotion();

  const trigger = useCallback(
    (origin: Rect, label?: string) =>
      new Promise<void>((resolve) => {
        if (reduceMotion) {
          resolve();
          return;
        }
        setState({ phase: "expand", origin, label });
        window.setTimeout(resolve, DURATION.zoomExpand * 1000);
      }),
    [reduceMotion]
  );

  const clear = useCallback(() => {
    setState((s) => {
      if (s.phase === "idle") return s;
      window.setTimeout(() => setState({ phase: "idle", origin: null }), DURATION.zoomReveal * 1000);
      return { ...s, phase: "reveal" };
    });
  }, []);

  return (
    <TransitionOverlayContext.Provider value={{ trigger, clear }}>
      {children}
      <AnimatePresence>
        {state.phase !== "idle" && state.origin && (
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[999] flex items-center justify-center overflow-hidden bg-cream"
            initial={{
              x: state.origin.x,
              y: state.origin.y,
              width: state.origin.width,
              height: state.origin.height,
              opacity: 0.55,
            }}
            animate={
              state.phase === "expand"
                ? {
                    x: 0,
                    y: 0,
                    width: typeof window !== "undefined" ? window.innerWidth : state.origin.width,
                    height: typeof window !== "undefined" ? window.innerHeight : state.origin.height,
                    opacity: 1,
                  }
                : { opacity: 0 }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration: state.phase === "expand" ? DURATION.zoomExpand : DURATION.zoomReveal,
              ease: EASE,
            }}
          >
            <AnimatePresence>
              {state.phase === "expand" && state.label && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: DURATION.zoomExpand * 0.45, duration: DURATION.base, ease: EASE }}
                  className="eyebrow text-gold-deep"
                >
                  {state.label}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionOverlayContext.Provider>
  );
}

function useTransitionOverlay() {
  const ctx = useContext(TransitionOverlayContext);
  if (!ctx) throw new Error("useTransitionOverlay must be used within TransitionOverlayProvider");
  return ctx;
}

/**
 * Drop-in replacement for next/link used at every "go deeper" point. Plays
 * the zoom-expand from the clicked element (or an explicit `originRect` —
 * e.g. the apartment region on a floor plan, when the visible link is a
 * separate CTA button elsewhere in a panel) before navigating.
 */
export function ZoomNavLink({
  href,
  children,
  className,
  label,
  originRect,
  onClick,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
  /** Short context label shown mid-transition, e.g. "Зграда 06" or "Стан 22". */
  label?: string;
  /** Use another element's rect as the zoom origin instead of this link's own. */
  originRect?: () => Rect | null;
  onClick?: () => void;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  const ref = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const { trigger } = useTransitionOverlay();

  async function handleClick(e: React.MouseEvent) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let modified/middle clicks behave natively
    e.preventDefault();
    onClick?.();
    const rect = originRect?.() ?? ref.current?.getBoundingClientRect();
    if (rect) {
      await trigger({ x: rect.x, y: rect.y, width: rect.width, height: rect.height }, label);
    }
    router.push(href);
  }

  return (
    <Link ref={ref} href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </Link>
  );
}

const noSubscription = () => () => {};

/** Wraps a destination page's primary content: settles into place and clears the overlay reveal on mount. */
export function ZoomEnter({ children, className }: { children: ReactNode; className?: string }) {
  const { clear } = useTransitionOverlay();
  const reduceMotion = useReducedMotion();
  // True while the page is the server's own HTML being picked up by the browser (a direct load or a refresh): then
  // there is no overlay to reveal from, and starting invisible would hide the page until the scripts have loaded.
  // A page reached by zooming in is mounted fresh in the browser, so it still settles in from the overlay.
  const fromServer = useSyncExternalStore(
    noSubscription,
    () => false,
    () => true
  );

  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={reduceMotion || fromServer ? false : { opacity: 0, scale: 1.035 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: DURATION.zoomReveal, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
