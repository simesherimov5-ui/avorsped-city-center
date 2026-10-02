"use client";

import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n";
import { useIntro } from "@/components/intro/IntroProvider";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { spawnClickPulse } from "@/lib/clickPulse";
import { isBlackPage } from "@/lib/theme";
import { usePageTransition } from "@/components/page-transition/PageTransition";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/projects", key: "nav.projects" },
  { href: "/completed-projects", key: "nav.completedProjects" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

// Which tab a path belongs to ("/projects/city-center" is under "Проекти"); null when it is none of them.
const tabFor = (path: string) =>
  LINKS.find((l) => (l.href === "/" ? path === "/" : path === l.href || path.startsWith(l.href + "/")))?.href ?? null;

// The bar slides away once the visitor has scrolled this far down, and comes back on any scroll up.
const HIDE_AFTER_PX = 160;

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { revealing, instant } = useIntro();
  const revealedAtMount = useRef(revealing);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Tied to the page it was set on, so every new page starts with the bar showing.
  const [hideState, setHideState] = useState({ hidden: false, path: pathname });
  const navRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const linkEls = useRef<Record<string, HTMLAnchorElement | null>>({});
  const linePlaced = useRef(false);
  const transition = usePageTransition();
  // While the curtain runs, the line already points at the tab that was clicked.
  const activeHref = tabFor(transition?.target ?? pathname);

  const isHome = pathname === "/";
  // The all-black pages (За нас, Контакт) get a black bar with a hairline, and an outline consultation button.
  const black = isBlackPage(pathname);

  // Entrance: hidden while the loading screen is up, then the bar fades down
  // with its links staggering in as the screen opens. Mounting after the
  // intro is over just shows the bar.
  useGSAP(
    () => {
      const nav = navRef.current;
      if (!nav) return;
      const links = nav.querySelectorAll<HTMLElement>(".nav-link");

      if (!revealing) {
        gsap.set(nav, { opacity: 0, y: -20 });
        gsap.set(links, { opacity: 0 });
        return;
      }

      if (instant || revealedAtMount.current) {
        gsap.set(nav, { opacity: 1, y: 0 });
        gsap.set(links, { opacity: 1 });
        return;
      }

      const tl = gsap.timeline();
      tl.to(nav, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.9);
      tl.to(links, { opacity: 1, stagger: 0.06, duration: 0.5 }, 1.1);

      return () => {
        tl.kill();
      };
    },
    { scope: navRef, dependencies: [revealing, instant] }
  );

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      // Reset when leaving the homepage so returning to it starts transparent.
      setScrolled(false);
    };
  }, [isHome]);

  // The gold underline is one element that slides to the active tab (0.6s); it jumps there on first
  // paint and on resize, and fades out on pages that are not one of the tabs.
  useEffect(() => {
    const place = (animate: boolean) => {
      const line = lineRef.current;
      const group = linksRef.current;
      if (!line || !group) return;
      const el = activeHref ? linkEls.current[activeHref] : null;
      if (!el) {
        gsap.to(line, { opacity: 0, duration: animate ? 0.3 : 0, overwrite: true });
        return;
      }
      const g = group.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      gsap.to(line, {
        x: r.left - g.left,
        width: r.width,
        opacity: 1,
        duration: animate ? 0.6 : 0,
        ease: "power3.inOut",
        overwrite: true,
      });
    };
    place(linePlaced.current);
    linePlaced.current = true;
    const onResize = () => place(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeHref]);

  // Hide on scroll down (after HIDE_AFTER_PX), show on scroll up. It never hides while the phone menu is
  // open or while a nav link has keyboard focus (a mouse click's focus doesn't count, or it would never hide).
  useEffect(() => {
    let lastY = window.scrollY;
    const set = (hidden: boolean) =>
      setHideState((s) => (s.hidden === hidden && s.path === pathname ? s : { hidden, path: pathname }));
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      const active = document.activeElement;
      const keyboardFocus = Boolean(navRef.current?.contains(active) && active?.matches(":focus-visible"));
      if (y < HIDE_AFTER_PX || keyboardFocus) set(false);
      else if (dy > 1) set(true);
      else if (dy < -1) set(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  const hidden = hideState.hidden && hideState.path === pathname && !open;

  // Overlay the hero when we're at the top of the homepage; everywhere else
  // (and once scrolled past the hero, or with the mobile menu open) the bar
  // is solid so it always reads against light page backgrounds.
  const solid = !isHome || scrolled || open;

  return (
    <>
      {/* The hide/show slide lives on this wrapper, not on the header: GSAP animates the header's own
          transform for the entrance and writes `translate: none` onto it, which would cancel the slide. */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          hidden ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <header
          ref={navRef}
          // Keyboard focus anywhere in the bar brings it back.
          onFocus={(e) => e.target.matches(":focus-visible") && setHideState({ hidden: false, path: pathname })}
          className={cn(
            "border-b transition-colors duration-500",
            black
              ? "border-paper/12 bg-black"
              : solid
                ? "border-on-chrome/10 bg-chrome/97 backdrop-blur-md"
                : "border-transparent bg-transparent"
          )}
        >
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 sm:px-8 sm:py-3 lg:px-10 lg:py-5">
            <Link
              id="site-logo"
              href="/"
              onPointerDown={spawnClickPulse}
              className="focus-ring nav-link relative isolate -ml-2 flex h-11 min-w-11 items-center justify-center px-2"
              aria-label="Јавор Шпед — почетна"
            >
              <Logo variant="icon" />
            </Link>

            <div className="hidden flex-1 items-center justify-center lg:flex">
              <div ref={linksRef} className="relative flex gap-7 xl:gap-9">
                {LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    ref={(el) => {
                      linkEls.current[link.href] = el;
                    }}
                    onPointerDown={spawnClickPulse}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cn(
                      "nav-link relative isolate whitespace-nowrap py-1 text-[12.5px] uppercase tracking-[0.08em] transition-colors focus-ring text-on-chrome/75 hover:text-on-chrome",
                      activeHref === link.href && "text-on-chrome"
                    )}
                  >
                    {t(link.key)}
                  </Link>
                ))}
                <span
                  ref={lineRef}
                  aria-hidden
                  className="pointer-events-none absolute -bottom-0.5 left-0 h-px w-0 bg-accent opacity-0"
                />
              </div>
            </div>

            <div className="nav-link hidden items-center gap-4 lg:flex">
              {black ? (
                <Link href="/consultation" onPointerDown={spawnClickPulse} className="bk-btn relative isolate">
                  {t("nav.consultation")}
                </Link>
              ) : (
                <Button href="/consultation" variant="primary" size="sm">
                  {t("nav.consultation")}
                </Button>
              )}
            </div>

            <div className="flex items-center lg:hidden">
              <button
                className="focus-ring -mr-2 flex h-11 w-11 items-center justify-center text-on-chrome"
                aria-controls="mobile-menu"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Затвори мени" : "Отвори мени"}
                aria-expanded={open}
              >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </nav>
        </header>
      </div>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Мени"
          className="mobile-menu fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink px-5 pb-8 pt-24 sm:px-8 lg:hidden"
        >
          <nav className="flex flex-1 flex-col justify-center">
            {LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                onPointerDown={spawnClickPulse}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "focus-ring relative isolate flex min-h-16 items-baseline gap-5 border-b border-line-dark py-4 font-display text-[clamp(1.75rem,8vw,2.5rem)] leading-tight last:border-0",
                  pathname === link.href ? "text-gold" : "text-paper"
                )}
              >
                <span className="eyebrow text-gold">{String(i + 1).padStart(2, "0")}</span>
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-8">
            <Button href="/consultation" variant="primary" className="w-full" onClick={() => setOpen(false)}>
              {t("nav.consultation")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
