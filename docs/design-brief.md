# Design brief

The one place where the site's visual direction is decided and recorded.
Developers and Claude Code propose; the client approves. Do not change the visual direction (palette, typography,
layout concept, motion style) without an approved entry in the decision log below.

## Direction

Status: **to be confirmed by the client.**

- In one sentence, what should the site feel like?
- Three to five tone words:
- Reference sites (links) and what to take from each:
- Audience and the primary action (for example: buyers explore units and book a consultation):
- What is explicitly out of scope:

## As built today

Facts read from the code, not decisions.

- Palette tokens in `app/globals.css` (`:root`, lines 9-16): `paper`, `ink`, `gold`, `gold-deep`, `gold-light`, `gold-dark`, `line`, `line-dark`.
  The older names `cream`, `warm-white`, `silver`, `concrete`, `charcoal`, `accent`, `accent-soft` are aliases of these.
  The README describes the palette as off-white, charcoal and a gold accent.
- Typefaces: Fraunces (display), Inter (body) and IBM Plex Mono, loaded with `next/font` and `subsets: ["latin"]` only (`app/layout.tsx`).
- Motion: two systems coexist. Framer Motion scroll reveals (`components/ui/Reveal.tsx`) and GSAP + Lenis (`components/motion/`, `components/intro/`). Both respect reduced-motion.
- Language: Macedonian (`<html lang="mk">`); English is planned.

## Known issues needing a client decision

- **Cyrillic typography.** Fraunces has no Cyrillic subset (Next's bundled font data lists latin, latin-ext, vietnamese), and Inter is loaded without its Cyrillic subset.
  Macedonian text therefore most likely renders in a fallback system font, not the intended typefaces. This was not checked in a browser.
  Decision needed: pick a display typeface with Cyrillic coverage, or accept the fallback.
- **Direction history.** The first week of work explored several directions (editorial, cinematic, portfolio-first homepage).
  This brief starts the record; later changes are logged below.

## Proposals

Written by `/design-proposal`. A proposal changes nothing until the client approves it and a row is added to the decision log.

Template:

```
### P<n>: <topic> (Status: Proposed)

- Problem and evidence (file:line; seen in the browser or code only):
- Options (2 or 3, with trade-offs):
- Recommendation:
- Files that would change:
- Cyrillic and accessibility check:
- Questions for the client:
- Approved by / date:
```

No proposals yet.

## Decision log

| Date | Decision | Approved by | Notes |
| ---- | -------- | ----------- | ----- |
|      |          |             |       |
