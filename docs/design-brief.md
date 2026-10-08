# Design brief

The one place where the site's visual direction is decided and recorded.
Developers and Claude Code propose; the client approves. Do not change the visual direction (palette, typography,
layout concept, motion style) without an approved entry in the decision log below.

## Direction

Status: **the identity «Бронза & Травертин» was approved on 2026-10-06** (decision log below). The reference is
`javor-sped-complete/reference/redizajn-bronza-travertin.html`; the numbers in the redesign brief are the source of truth.

- **Six colours, nothing else** (every other shade is one of them at an opacity): Оникс `#14110F` (main dark), Еспресо
  `#221C17` (cards and surfaces on dark), Травертин `#F2E9DA` (text on dark; the light page background is the owner's sand `#E0CAB6`), Варовник `#E5D8C3`
  (surfaces and form fields on light), Бронза `#6D533E` (accent on light only), Светол бакар `#BC9676` (accent on dark only).
  On dark: text Травертин, accent Светол бакар. On light: text Оникс, accent Бронза. Never Светол бакар as text on light,
  never Бронза as text on dark. Every page keeps the light or dark surface it has.
- **Two typefaces:** Playfair Display for headings and large display numbers; Montserrat for everything else.
- **Shape and motion:** square corners (0–2px), no shadows, no gradients except photo scrims and the one sheen in the footer;
  slow and calm motion (0.8–1.4s, `cubic-bezier(.22,1,.36,1)`, no bounce or overshoot), at most one large animated moment per section.
- **Components:** the filling primary button, the floor picker on the building page, the self-drawing logo in the opening, the
  year counter, the metallic sheen on the footer name, the schematic location map, and the project card hover.
- Still open (not decided): tone words, reference sites, audience and primary action, what is out of scope.

## As built today

Facts read from the code, not decisions.

- Palette tokens in `app/globals.css` (`:root`): the six colours `onyx`, `espresso`, `travertine`, `limestone`, `bronze`, `copper`.
  The names the code already used are aliases of them: `paper` = Травертин, `ink` = Оникс, `--black` = Оникс, `gold` and
  `accent` = Светол бакар, `gold-deep` and `gold-dark` = Бронза, `gold-light` and `accent-soft` = Травертин, `warm-white` and
  `silver` = Варовник, `cream` = Травертин, `charcoal` and `chrome` = Оникс, `on-chrome` = Травертин. `line` is Оникс at 12%,
  `line-dark` Травертин at 12%, `muted` Оникс at 68%.
- Typefaces: exactly two, both loaded with `next/font` and `subsets: ["latin", "cyrillic"]` (`app/layout.tsx`): Playfair Display (400,
  500 and 400 italic) for H1–H3 and large display numbers, and Montserrat (300, 400, 500, 600) for everything else. Every number that used
  the monospace font (stat numbers, "05 / 09", floor numbers) is Montserrat 500 with tabular numbers; there is no monospace font.
  The scale (`.t-h1` 64–104px, `.t-h2` 40–56px, `.t-h3` 26–30px from 768px up; phones keep their old heading sizes) is in
  `app/globals.css`. Body text is weight 300 at 16–18px; text under 16px is weight 400 or heavier.
- Components of the identity: the filling primary button (`.btn-primary` in `app/globals.css`, used by `components/ui/Button.tsx`,
  the form submit and the closing call to action; `data-tone="dark"` on dark surfaces), the floor picker on the building page
  (`components/floor-picker/`), the opening where the logo builds itself (`components/javor-sped-intro/`), the homepage sections
  from the board (`components/home/`: manifest, film, projects being built, numbers with the year counter, what sets us apart,
  soon), the sheen on the footer wordmark (`.footer-sheen`) and the schematic location map
  (`components/location-map/`), which replaced the Leaflet and Google maps. Gradients and shadows: only photo scrims and that sheen.
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

| Date       | Decision                                                                                                                                                                                                                                                                                                                                                           | Approved by                                       | Notes                                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-04 | Heading font: Playfair Display (400, 400 italic), with Cyrillic. Inter and IBM Plex Mono also load Cyrillic.                                                                                                                                                                                                                                                       | Client (default choice stated in the audit brief) | Replaces Fraunces. Cormorant Garamond and Source Serif 4 were shown side by side; the client can still pick one of them (one constant in `app/layout.tsx` and `--font-display` in `app/globals.css`). |
| 2026-10-06 | За нас: the group's companies as a clickable circle (nine points on a gold ring, the selected company described in the middle, autoplay every 7 s) instead of the single line of names. Reference: `javor-sped-complete/reference/za-nas-kompanii-krug.html`.                                                                                                      | Sime, 2026-10-06                                  | Colours, fonts and tokens unchanged. Texts and links come later (`docs/content-needed.md` 1.8). Reduced motion: no autoplay, no arc, no pause button.                                                 |
| 2026-10-06 | New identity «Бронза & Травертин»: six colours, Playfair Display + Montserrat, components per `javor-sped-complete/reference/redizajn-bronza-travertin.html`.                                                                                                                                                                                                      | Sime                                              | Phases: 1 colours, 2 fonts, 3 primary button, 4 floor picker, 5 opening, 6 year counter, 7 footer sheen, 8 location map. Page layouts, texts, data and routes stay as they are.                       |
| 2026-10-07 | Homepage merged with the artifact board 03 (kept our photo hero and real content): big serif headline with an italic accent, then the board's sections in its order (manifest, film, projects being built, numbers, what sets us apart, soon), our own closing call to action and footer. The page change is a plain curtain wipe, 2.7s. Approved by Sime in chat. | Sime                                              |
