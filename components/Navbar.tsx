"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n";
import { useIntro } from "@/components/intro/IntroProvider";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { spawnClickPulse } from "@/lib/clickPulse";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/projects", key: "nav.projects" },
  { href: "/completed-projects", key: "nav.completedProjects" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { revealing, instant } = useIntro();
  const revealedAtMount = useRef(revealing);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const isHome = pathname === "/";

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

  // Overlay the hero when we're at the top of the homepage; everywhere else
  // (and once scrolled past the hero, or with the mobile menu open) the bar
  // is solid so it always reads against light page backgrounds.
  const solid = !isHome || scrolled || open;

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500",
          solid ? "border-on-chrome/10 bg-chrome/97 backdrop-blur-md" : "border-transparent bg-transparent"
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

          <div className="hidden flex-1 items-center justify-center gap-7 lg:flex xl:gap-9">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onPointerDown={spawnClickPulse}
                className={cn(
                  "nav-link group relative isolate whitespace-nowrap py-1 text-[12.5px] uppercase tracking-[0.08em] transition-colors focus-ring text-on-chrome/75 hover:text-on-chrome",
                  pathname === link.href && "text-on-chrome"
                )}
              >
                {t(link.key)}
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100",
                    pathname === link.href && "scale-x-100"
                  )}
                  aria-hidden
                />
              </Link>
            ))}
          </div>

          <div className="nav-link hidden items-center gap-4 lg:flex">
            <Button href="/consultation" variant="primary" size="sm">
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
