@AGENTS.md

# Јавор Шпед City Center

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4 · Framer Motion and GSAP/Lenis. Mock-data sales prototype, not live. Assume anything you push may be public.

## Start here

- Open sessions on the repo folder. Run `/context`: `CLAUDE.md` must be listed under Memory files.
- Roadmap work: `/roadmap-item <n>` (plans first, then implements). Audits: `/ux-audit` (writes `docs/ux-audit.md`, changes no code). Before a pull request, ask the `reviewer` subagent to review the diff.

## Commands

- `npm run check`: lint + typecheck + format check + unit tests (~10s). Must pass before you say work is done.
- `npm run build`: also run it for route, config or data changes.
- `npm run format`: Prettier. A hook already formats files you edit.
- `npm ci` once in a fresh checkout; AGENTS.md's docs path needs `node_modules`.
- There are no e2e tests yet. For UI changes, run `npm run dev`, load the affected route, and say so if you couldn't.

## Layout

- `app/` routes · `components/` UI (`ui/` primitives, `motion/` and `intro/` for GSAP/Lenis) · `data/` mock and real data · `lib/` helpers (format, i18n, gsap, motion) · `types/` entities
- `data/` is the only code that knows how data is generated. Pages import from `@/data` (or `@/data/dojran`).

## Conventions

- Project photography goes through `components/ui/Media.tsx`. No `next/image` or `<img>` elsewhere. Known exception: `RealFloorPlanViewer.tsx`.
- Status and type labels come from `lib/format.ts`. Don't hardcode them. Known duplicate: `ApartmentFilters.tsx`.
- Use the colour tokens in `app/globals.css`. No new hex colours (existing ones are in `FloorPlan.tsx`).
- No setState inside an effect body (lint fails). Details and the two sanctioned exceptions: `.claude/rules/components.md`.
- Two animation systems coexist (Framer Motion, GSAP + Lenis). Use the one a page already uses; don't add a third. Details: `.claude/rules/design.md`.
- Before changing routing, metadata, caching or `next.config.ts`, read the matching guide in `node_modules/next/dist/docs/`. Skip that for plain component edits.

## Ask first

- Anything under `public/` (client assets), `package-lock.json`, `next.config.ts`, `.github/`, new dependencies, the real-unit data in `data/generate.ts`.
- Changing the visual direction (palette, typography, layout concept, motion style): needs an approved entry in `docs/design-brief.md`. Design skills only propose.
- Never commit `.env*`, client documents, prices or personal data, and keep them out of commit and PR text.

## Workflow

- For anything touching more than a couple of files: plan first, list the files, wait for approval.
- One concern per commit, imperative messages. Work on a branch and merge through a pull request; never push to `main`.
- Planned work and decisions live in `docs/roadmap.md` (read it before starting a roadmap item); design decisions in `docs/design-brief.md`.
