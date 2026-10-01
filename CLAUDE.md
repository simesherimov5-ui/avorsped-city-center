@AGENTS.md

# Јавор Шпед City Center

Next.js 16 App Router · React 19 · TypeScript strict · Tailwind v4. Mock-data sales prototype, not live. Assume anything you push may be public.

## Commands

- `npm run check`: lint + typecheck + format check + unit tests (~10s). Must pass before you say work is done.
- `npm run build`: also run it for route, config or data changes.
- `npm run format`: Prettier. A hook already formats files you edit.
- `npm ci` once in a fresh checkout; AGENTS.md's docs path needs `node_modules`.
- There are no e2e tests yet. For UI changes, run `npm run dev`, load the affected route, and say so if you couldn't.

## Layout

- `app/` routes · `components/` UI (`components/ui/` primitives) · `data/` mock and real data · `lib/` helpers (format, i18n) · `types/` entities
- `data/` is the only code that knows how data is generated. Pages import from `@/data` (or `@/data/dojran`).

## Conventions

- Project photography goes through `components/ui/Media.tsx`. No `next/image` or `<img>` elsewhere. Known exception: `RealFloorPlanViewer.tsx`.
- Status and type labels come from `lib/format.ts`. Don't hardcode them. Known duplicate: `ApartmentFilters.tsx`.
- Use the colour tokens in `app/globals.css`. No new hex colours (existing ones are in `FloorPlan.tsx`).
- Before changing routing, metadata, caching or `next.config.ts`, read the matching guide in `node_modules/next/dist/docs/`. Skip that for plain component edits.

## Ask first

- Anything under `public/` (client assets), `package-lock.json`, `next.config.ts`, `.github/`, new dependencies, the real-unit data in `data/generate.ts`.
- Changing the visual direction (palette, typography, layout concept, motion style): needs an approved entry in `docs/design-brief.md`.
- Never commit `.env*`, client documents, prices or personal data, and keep them out of commit and PR text.

## Workflow

- For anything touching more than a couple of files: plan first, list the files, wait for approval.
- One concern per commit, imperative messages. Work on the assigned branch; never push to `main`.
- Planned work and decisions live in `docs/roadmap.md` (read it before starting a roadmap item); design decisions in `docs/design-brief.md`.
