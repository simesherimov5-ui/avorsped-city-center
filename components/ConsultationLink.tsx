"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink as Link } from "@/components/page-transition/TransitionLink";
import { contactHref, scrollToBookingForm } from "@/lib/contact-link";

/**
 * A "Закажи консултација" link for places that don't know which page they are on (the footer): it opens the
 * Контакт page with the current apartment / building / project as the reference, through the curtain
 * transition. On the Контакт page it scrolls to the booking form instead.
 */
export function ConsultationLink({ className, children }: { className?: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Link
      href={contactHref(pathname)}
      className={className}
      onClick={
        pathname === "/contact"
          ? (e) => {
              e.preventDefault();
              scrollToBookingForm();
            }
          : undefined
      }
    >
      {children}
    </Link>
  );
}
