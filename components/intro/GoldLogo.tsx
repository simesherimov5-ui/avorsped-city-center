import { forwardRef } from "react";

/**
 * The site's real mark (the same building silhouette used in the navbar,
 * `components/ui/Logo.tsx`'s BuildingMark), re-rendered in the gold
 * gradient for the preloader. It's line art on the real logo card (gold
 * strokes on dark), not a filled glyph, so the gradient is applied as a
 * stroke here rather than a fill — a placeholder "JS" monogram would have
 * been a brand inconsistency once a real mark already exists.
 */
export const GoldLogo = forwardRef<SVGSVGElement, { className?: string }>(function GoldLogo({ className }, ref) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 40 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="40" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8E7240" />
          <stop offset="33%" stopColor="#C9A45C" />
          <stop offset="66%" stopColor="#E6CF9A" />
          <stop offset="100%" stopColor="#C9A45C" />
        </linearGradient>
      </defs>
      <path d="M20 2 L36 15 V54 H4 V15 L20 2Z" stroke="url(#goldGradient)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 15 L20 27 L36 15" stroke="url(#goldGradient)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M20 27 V54" stroke="url(#goldGradient)" strokeWidth="1.2" />
      <path d="M12 34 V54" stroke="url(#goldGradient)" strokeWidth="1" />
      <path d="M28 34 V54" stroke="url(#goldGradient)" strokeWidth="1" />
    </svg>
  );
});
