"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n";
import { useIntro } from "@/components/intro/Preloader";
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
  const { ready, instant } = useIntro();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const isHome = pathname === "/";

  // Entrance: the bar fades down as a whole, with its links staggering in —
  // gated on the preloader so the navbar reveals alongside the hero, not
  // before it. Snaps straight to visible on a repeat visit this session.
  useGSAP(
    () => {
      if (!ready || !navRef.current) return;
      const links = navRef.current.querySelectorAll<HTMLElement>(".nav-link");

      if (instant) {
        gsap.set(navRef.current, { opacity: 1, y: 0 });
        gsap.set(links, { opacity: 1 });
        return;
      }

      gsap.set(navRef.current, { opacity: 0, y: -20 });
      gsap.set(links, { opacity: 0 });
      const tl = gsap.timeline();
      tl.to(navRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.9);
      tl.to(links, { opacity: 1, stagger: 0.06, duration: 0.5 }, 1.1);

      return () => {
        tl.kill();
      };
    },
    { scope: navRef, dependencies: [ready, instant] }
  );

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Overlay the hero when we're at the top of the homepage; everywhere else
  // (and once scrolled past the hero, or with the mobile menu open) the bar
  // is solid so it always reads against light page backgrounds.
  const solid = !isHome || scrolled || open;

  return (
    <header
      ref={navRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500",
        solid ? "border-on-chrome/10 bg-chrome/97 backdrop-blur-md" : "border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10 lg:py-5">
        <Link id="site-logo" href="/" onPointerDown={spawnClickPulse} className="focus-ring nav-link relative isolate">
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

        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="text-on-chrome focus-ring"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Затвори мени" : "Отвори мени"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-on-chrome/10 bg-chrome lg:hidden">
          <div className="flex flex-col px-6 py-2">
            {LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                onPointerDown={spawnClickPulse}
                className="relative isolate flex items-baseline gap-4 border-b border-on-chrome/10 py-4 text-lg text-on-chrome/90 last:border-0 focus-ring"
              >
                <span className="eyebrow text-accent">{String(i + 1).padStart(2, "0")}</span>
                {t(link.key)}
              </Link>
            ))}
            <Button
              href="/consultation"
              variant="primary"
              size="sm"
              className="mb-2 mt-6 w-full"
              onClick={() => setOpen(false)}
            >
              {t("nav.consultation")}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
