import { getLenis } from "@/lib/lenis";

/**
 * Where a "Закажи консултација" button on `pathname` goes: the Контакт page, carrying what the visitor is
 * looking at (an apartment, a building or a project), so the booking form opens with the interest pre-selected
 * and a reference tag. Anywhere else it is the plain Контакт page.
 */
export function contactHref(pathname: string): string {
  const apartment = pathname.match(/^\/apartments\/([^/]+)\/?$/);
  if (apartment) return `/contact?apartment=${encodeURIComponent(apartment[1])}`;
  const building = pathname.match(/^\/development\/([^/]+)/);
  if (building) return `/contact?building=${encodeURIComponent(building[1])}`;
  const project = pathname.match(/^\/projects\/([^/]+)\/?$/);
  if (project) return `/contact?project=${encodeURIComponent(project[1])}`;
  if (pathname === "/dojran" || pathname.startsWith("/dojran/")) return "/contact?project=dojranski-raj";
  return "/contact";
}

/**
 * On the Контакт page itself the consultation buttons don't reload it: they scroll (smoothly) to the booking
 * form and move focus to its first step.
 */
export function scrollToBookingForm() {
  const form = document.querySelector<HTMLElement>(".ct-form");
  if (!form) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = getLenis();
  if (lenis && !reduced) lenis.scrollTo(form, { offset: -110, duration: 1.1 });
  else form.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  form
    .querySelector<HTMLElement>('[data-group="interest"] [role="radio"][tabindex="0"]')
    ?.focus({ preventScroll: true });
}
