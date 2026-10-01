# Roadmap and architecture decisions

Working document for the people and agents extending this project. Update it in the same PR that changes a decision.

## How we work

1. **Open every Claude Code session on the repo folder.** In the desktop app the session header must show the project folder, not "No folder".
   Run `/context` and check that `CLAUDE.md` is listed under Memory files. Without a folder, none of this repo's rules, hooks or permissions load.
2. **One roadmap item per session.** Start with `/roadmap-item <n>`: it asks for a plan and the list of files, waits for approval, then implements.
   Ask the `reviewer` subagent to check the diff before opening a pull request.
3. **Commit after each prompt.** Usage limits can end a session mid-task.
4. **Done means `npm run check` is green** (a Stop hook enforces it) **and CI is green** on the pull request.
5. **Work on a branch and merge through a pull request.** Keep `main` deployable.
6. **Audit prompts write findings to a file, not code.** Use `/ux-audit`, which writes `docs/ux-audit.md`. Fix findings as separate roadmap items.
7. **Visual direction changes need an approved entry in `docs/design-brief.md` first.**
8. **Prompts drafted elsewhere (a chat Project, for example) should point at roadmap items,** not restate rules. This repo is the source of truth.

## Target architecture

```
Browser → Next storefront (Server Components, next-intl)
            → features/* → repository interfaces (server-only)
                              ├─ MockAdapter    (today: seeded, deterministic)
                              ├─ CMS adapter    (when someone other than a developer must edit content)
                              └─ API adapter    (only if a real domain service appears)
          Booking/consultation → Server Action (Zod-validated) → leads sink
```

Dependency rule: `app → features → components/ui, lib, domain`; data access only through `server/data` repositories.
Primitives never import features; features import each other only through their `index.ts`.
Move existing files into `features/` when you touch them, not in one big-bang move.

## Known gaps today

- Client components and whole pages import `@/data` directly, so the generator and dataset run in the browser bundle.
  This blocks swapping in a real backend.
- `RealFloorPlanViewer.tsx` renders a raw `<img>` instead of going through `Media`.
- Status labels are duplicated in `ApartmentFilters.tsx` instead of using `lib/format.ts`.
- The i18n scaffold in `lib/i18n.tsx` is used by two files; almost all UI text is hardcoded Macedonian.
- Forms (consultation, contact) are mocks.
- Two animation systems coexist: Framer Motion (`components/ui/Reveal.tsx`, older pages) and GSAP + Lenis (`components/motion/`, `components/intro/`, `lib/gsap.ts`).
  `components/ui/SmoothScroll.tsx` appears unused (only the `components/motion/` version is imported). Decide whether to consolidate.
- Two `eslint-disable react-hooks/set-state-in-effect` lines are deliberate post-mount syncs (`app/apartments/page.tsx`, `components/intro/Preloader.tsx`).
  `useSyncExternalStore` would remove them but needs a browser test.

## Sequence

One PR per row, in order. Characterization tests come before refactors.

| #   | Work                                                                                                  | Done when                                         |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 0   | Foundation: typecheck, Prettier, Vitest, CI, Claude Code config                                       | `npm run check` and CI are green on a fresh clone |
| 1   | Playwright smoke tests of current behaviour (browse → floor → apartment, compare, booking form)       | Tests pass on `main` before any refactor          |
| 2   | Guardrails: lint rule against `next/image` outside `Media`, fix `RealFloorPlanViewer`, labels         | Lint fails on the known violations                |
| 3   | Server-only data layer: `domain/` Zod schemas, async repositories, deterministic seed                 | No client file imports data directly              |
| 3b  | Pages to Server Components, one PR per page group, with before/after bundle size from `next build`    | Bundle shrinks; pages receive plain props         |
| 4   | i18n: `next-intl`, `app/[locale]`, `mk` default plus `en`, key-parity test, Cyrillic-literal CI check | Every page works in `/mk` and `/en`               |

## Deferred until triggered

Trigger: a hosting decision, a launch date, or the first non-developer who must edit content or unit status.

- Booking Server Action with validation, spam protection and a real destination.
- CMS (preferred: Payload, MIT, TypeScript, Postgres, built-in localization, deployed as a separate app) behind the repository interface.
  Do not read the CMS database tables from another service; use its API.
- A .NET service only when real domain logic appears (reservation holds, CRM or payment integrations, pricing rules).
- Asset pipeline, production hardening (env validation, security headers, sitemap, Lighthouse budgets).
- `cacheComponents` and the React Compiler, only with real data and a measured need.

## i18n decisions

- Locales: `mk` (default) and `en`. Library: `next-intl` with `app/[locale]` routing (verify against its current docs when implementing).
- UI strings live in `messages/mk.json` and `messages/en.json`; components contain no literal user-facing text.
- Open: whether URL slugs stay Latin.
- The display font (Fraunces) has no Cyrillic subset, and Inter is loaded without its Cyrillic subset; see `docs/design-brief.md`.
