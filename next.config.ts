import type { NextConfig } from "next";

// Headers that are safe on every page. A script-src policy is left out on purpose: it needs a per-request nonce,
// which would make every page render on demand instead of being served ready-made (see the CSP guide in
// node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md). Revisit if a form or embed is added.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site is not meant to be shown inside another site's frame.
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    qualities: [75, 90, 100],
  },
  // The old consultation page is gone: every "Закажи консултација" goes to the Контакт page. Query values
  // (project, building, apartment) are passed through, so old links keep their reference.
  redirects() {
    return [{ source: "/consultation", destination: "/contact", permanent: true }];
  },
  headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
