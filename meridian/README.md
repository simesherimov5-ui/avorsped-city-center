# Јавор Шпед — City Center Prototype

A premium digital sales experience prototype for Exclusive Building (Јавор Шпед Holding), built around the six-building **City Center** residential development in Strumica. Buyers can explore the masterplan, drill into a building → floor → apartment, filter and compare units, and book a consultation — all pre-filled with the context they were browsing.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** — restrained palette (off-white / charcoal / gold accent), see `app/globals.css`
- **Framer Motion** for scroll reveals and interaction states
- **Lucide** icons

## Getting Started

```bash
npm ci                # install (Node 22, see .nvmrc)
npm run dev           # dev server at http://localhost:3000
npm run build         # production build (also type-checks)
npm run check         # lint + typecheck + format check + unit tests
npm run format        # Prettier
npm test              # Vitest unit tests
```

CI (`.github/workflows/ci.yml`) runs the same checks plus the build on every pull request.
Contributor and agent conventions are in `CLAUDE.md`; planned work is in `docs/roadmap.md`.

## Architecture

```
/app          Routes (App Router). Dynamic routes: development/[buildingId]/[floor],
              apartments/[id], projects/[slug]
/components   UI components. components/ui/ holds primitives (Button, Media, Placeholder, …)
/data         Centralized, typed mock data layer — see below
/lib          Formatting, i18n scaffold, compare-context, asset lookup helpers
/types        Shared TypeScript interfaces for every entity
/public       Images and video. Real project assets live under images/exteriors,
              images/floorplans, images/site, images/brand, videos/
```

### Data layer — this is the CMS seam

`data/generate.ts` procedurally generates realistic mock apartments for all six
buildings so the prototype feels populated (~180 units, mixed sizes/statuses).
**Building 06 / Floor 3 is the one exception**: it's overridden with real
architectural data (`REAL_B06_F3_UNITS`) sourced from the client's own floor-plan
documentation, including per-apartment floor-plan images. That override is the
intended pattern for connecting a real backend/CMS later — replace
`generateDevelopment()` with a real data fetch and every page keeps working
unchanged, since nothing outside `/data` reaches into the generation logic.

Apartment status (`available` / `reserved` / `sold`) is centralized in this one
place — no component hardcodes status anywhere.

### Real vs. placeholder assets

`components/ui/Media.tsx` is the single seam between mock and real assets: pass
an image object with `isPlaceholder: false` and a `src`, and it renders the real
photo; otherwise it falls back to a clearly-labeled placeholder
(`components/ui/Placeholder.tsx`). Never render `<Image>` directly for
project photography — always go through `Media` so future real assets slot in
by editing `/data` alone.

### Multilingual scaffold

`lib/i18n.tsx` is a flat key/locale dictionary (currently `mk` only is fully
populated; `en` has the nav strings as a starting point). Add a locale by
adding a key to `LOCALES` and filling in the dictionary — no page changes
needed.

## Known limitations (by design, for a prototype)

- Apartment/company data is mock except the Building 06/Floor 3 override noted above.
- Forms (consultation, contact) show a mock success state — nothing is actually sent.
- 360°/3D apartment tours are a labeled, interactive placeholder (`components/ApartmentTour.tsx`)
  ready to accept a real panorama/GLB viewer.
