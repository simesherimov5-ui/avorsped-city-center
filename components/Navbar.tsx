"use client";

import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n";
import { useIntro } from "@/components/intro/IntroProvider";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { spawnClickPulse } from "@/lib/clickPulse";
import { contactHref, scrollToBookingForm } from "@/lib/contact-link";
import { usePageTransition } from "@/components/page-transition/PageTransition";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/projects", key: "nav.projects" },
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
  const transition = usePageTransition();
  // While the curtain runs, the line already points at the tab that was clicked.
  const activeHref = tabFor(transition?.target ?? pathname);

  const isHome = pathname === "/";
  // Every consultation button opens the Контакт page, carrying the apartment / building / project being looked
  // at. On the Контакт page itself it scrolls to the booking form and focuses its first step instead.
  const onContact = pathname === "/contact";
  const consultHref = contactHref(pathname);
  const consultClick = onContact
    ? (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        scrollToBookingForm();
      }
    : undefined;

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
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      // Reset when leaving the homepage so returning to it starts transparent.
      setScrolled(false);
    };
  }, [pathname]);

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
  // On the projects page the navbar stays in view: its filter bar sticks right under it.
  const hidden = hideState.hidden && hideState.path === pathname && !open && pathname !== "/projects";

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
            "border-b transition-[background-color,border-color,backdrop-filter] duration-300",
            // Over the hero the bar is clear; everywhere else, and once the page is scrolled past 40px, it is Оникс 92% with a blur
            // and a hairline below.
            solid
              ? "border-on-chrome/[0.08] bg-chrome/[0.92] backdrop-blur-[12px]"
              : "border-transparent bg-transparent"
          )}
        >
          <nav className="container-x flex h-[76px] items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]">
            <Link
              id="site-logo"
              href="/"
              onPointerDown={spawnClickPulse}
              className="focus-ring nav-link relative isolate -ml-2 flex h-11 min-w-11 items-center justify-center px-2 lg:justify-self-start"
              aria-label="Javor Sped Holding — почетна"
            >
              <Logo variant="icon" />
            </Link>

            <div className="hidden items-center gap-10 lg:flex">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onPointerDown={spawnClickPulse}
                  aria-current={pathname === link.href ? "page" : undefined}
                  data-active={activeHref === link.href ? "" : undefined}
                  className="nav-link nav-tab focus-ring relative isolate whitespace-nowrap py-2 text-[12px] font-medium uppercase tracking-[0.14em] text-on-chrome/[0.72] transition-colors duration-300 hover:text-on-chrome data-[active]:text-on-chrome"
                >
                  {t(link.key)}
                </Link>
              ))}
            </div>

            <div className="nav-link hidden items-center lg:flex lg:justify-self-end">
              {/* One button, one style, on every page (the black pages only change the bar's background). */}
              <Button href={consultHref} onClick={consultClick} variant="primary" size="sm" tone="dark">
                {t("nav.consultation")}
              </Button>
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
          <nav className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            {LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                onPointerDown={spawnClickPulse}
                aria-current={pathname === link.href ? "page" : undefined}
                style={{ animationDelay: `${0.12 + i * 0.06}s` }}
                className={cn(
                  "mobile-link focus-ring relative isolate flex min-h-14 items-center font-display text-[24px] font-normal leading-tight",
                  pathname === link.href ? "text-accent" : "text-paper"
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-8">
            <Button
              href={consultHref}
              variant="primary"
              tone="dark"
              className="w-full"
              onClick={(e) => {
                setOpen(false);
                if (onContact) {
                  e.preventDefault();
                  // Wait for the menu to close and release its scroll lock, then scroll.
                  setTimeout(scrollToBookingForm, 120);
                }
              }}
            >
              {t("nav.consultation")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
