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
- Typefaces: Playfair Display (display, 400 and 400 italic), Inter (body) and IBM Plex Mono, all loaded with `next/font` and `subsets: ["latin", "cyrillic"]` (`app/layout.tsx`).
- Motion: two systems coexist. Framer Motion scroll reveals (`components/ui/Reveal.tsx`) and GSAP + Lenis (`components/motion/`, `components/intro/`). Both respect reduced-motion.
- Language: Macedonian (`<html lang="mk">`); English is planned.

## Known issues needing a client decision

- **Cyrillic typography.** Resolved on 2026-10-04: the old display font (Fraunces) had no Cyrillic letters, so every Macedonian
  heading fell back to a different system serif on each device while Latin words rendered in Fraunces. The headings now use
  Playfair Display, and Inter and IBM Plex Mono are loaded with their Cyrillic subsets too. Checked in a browser with
  `CSS.getPlatformFontsForNode`: every heading renders in Playfair Display, body text in Inter. Candidates compared: Playfair
  Display (chosen by default), Cormorant Garamond, Source Serif 4.
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

| Date       | Decision                                                                                                                                                                                                                                                      | Approved by                                       | Notes                                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-04 | Heading font: Playfair Display (400, 400 italic), with Cyrillic. Inter and IBM Plex Mono also load Cyrillic.                                                                                                                                                  | Client (default choice stated in the audit brief) | Replaces Fraunces. Cormorant Garamond and Source Serif 4 were shown side by side; the client can still pick one of them (one constant in `app/layout.tsx` and `--font-display` in `app/globals.css`). |
| 2026-10-06 | За нас: the group's companies as a clickable circle (nine points on a gold ring, the selected company described in the middle, autoplay every 7 s) instead of the single line of names. Reference: `javor-sped-complete/reference/za-nas-kompanii-krug.html`. | Sime, 2026-10-06                                  | Colours, fonts and tokens unchanged. Texts and links come later (`docs/content-needed.md` 1.8). Reduced motion: no autoplay, no arc, no pause button.                                                 |
