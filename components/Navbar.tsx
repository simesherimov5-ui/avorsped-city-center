"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/projects", key: "nav.projects" },
  { href: "/development", key: "nav.development" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-warm-white/10 bg-charcoal">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
        <Link href="/" className="flex flex-col leading-none text-warm-white focus-ring">
          <span className="font-display text-lg tracking-tight">Јавор Шпед</span>
          <span className="mt-1 text-[9px] uppercase tracking-[0.3em] text-warm-white/50">Holding</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm tracking-wide transition-colors focus-ring text-warm-white/80 hover:text-warm-white",
                pathname === link.href && "text-accent"
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </div>

        <Button href="/consultation" variant="primary" size="sm" className="hidden lg:inline-flex">
          {t("nav.consultation")}
        </Button>

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
          <div className="flex flex-col gap-1 px-6 py-4">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-warm-white/90 border-b border-warm-white/10 last:border-0 focus-ring"
              >
                {t(link.key)}
              </Link>
            ))}
            <Button
              href="/consultation"
              variant="primary"
              size="sm"
              className="mt-4 w-full"
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
