---
paths:
  - "app/**/*.tsx"
  - "components/**/*.tsx"
---

- **No setState in an effect body.** `react-hooks/set-state-in-effect` fails lint and CI. Prefer: derive the value during render; update state in event handlers; reset state with a `key`; read browser-only external state (storage, `matchMedia`, the URL) with `useSyncExternalStore`.
- Two documented exceptions exist: the post-mount URL sync in `app/apartments/page.tsx` and the `sessionStorage` check in `components/intro/Preloader.tsx`. Both keep the first render identical to the server's. Don't add a third `eslint-disable` for this rule without asking; say why `useSyncExternalStore` doesn't fit.
- New components are Server Components unless they need state, effects, browser APIs or event handlers. Keep `"use client"` leaves small. Don't convert existing client pages or components as a side effect of another task (roadmap item 3b does that, one page group per PR).
- Respect reduced motion: `prefersReducedMotion` from `@/lib/gsap` for GSAP, `useReducedMotion` for Framer Motion.
- Interactive elements are real buttons or links, images have alt text, and focus styles stay visible.
