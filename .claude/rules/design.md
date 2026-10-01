---
paths:
  - "app/**"
  - "components/**"
  - "**/*.css"
---

- The look of the site is decided in `docs/design-brief.md` by the client. Design skills (UI/UX Pro Max, Frontend Design and similar) produce **proposals**: don't apply a redesign because a skill suggests it. Run `/design-proposal` to log one and wait for approval.
- Two animation systems coexist: Framer Motion (`components/ui/Reveal.tsx`, older pages) and GSAP + Lenis (`components/motion/`, `components/intro/`, `lib/gsap.ts`, `lib/motion.ts`). Reuse the helper of the system a page already uses. Don't introduce a third; consolidating is a roadmap decision (`docs/roadmap.md`, Known gaps).
- Use the tokens in `app/globals.css` (canonical: `paper`, `ink`, `gold*`, `line*`; the older names are aliases). Lint rejects new hex colours outside the baseline listed in `eslint.config.mjs`.
- Leave existing Macedonian copy as it is unless asked. Write new UI text in Cyrillic and keep it easy to move into `messages/*.json` (roadmap item 4).
