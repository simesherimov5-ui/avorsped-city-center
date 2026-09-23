"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/projects", key: "nav.projects" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

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
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500",
        solid ? "border-warm-white/10 bg-charcoal/97 backdrop-blur-md" : "border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10 lg:py-5">
        <Link href="/" className="focus-ring">
          <Logo variant="inline" />
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-7 lg:flex xl:gap-9">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative whitespace-nowrap py-1 text-[12.5px] uppercase tracking-[0.08em] transition-colors focus-ring text-warm-white/75 hover:text-warm-white",
                pathname === link.href && "text-warm-white"
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

        <div className="hidden lg:block">
          <Button href="/consultation" variant="primary" size="sm">
            {t("nav.consultation")}
          </Button>
        </div>

        <button
          className="text-warm-white lg:hidden focus-ring"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Затвори мени" : "Отвори мени"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-warm-white/10 bg-charcoal lg:hidden">
          <div className="flex flex-col px-6 py-2">
            {LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-warm-white/10 py-4 text-lg text-warm-white/90 last:border-0 focus-ring"
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
