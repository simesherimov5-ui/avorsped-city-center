# Overnight report, 2026-11-12

Unattended run on `dev`. Nothing was pushed. Every commit below passed `npm run check` and `npm run build` at the time it was made
(the dev server was stopped for each build and restarted after). Screenshots are in `docs/overnight-2026-11-12/`.

| Task                                        | Commit    |
| ------------------------------------------- | --------- |
| Part A: opening +20%, header links centring | `3f2052f` |
| Part B: /projects subtitle under the h1     | `e6e04bf` |
| Part C: City Center layout, cream picker    | `82dac32` |
| Task 8: apartment page                      | `29d00cc` |
| Task 9: «Во што веруваме» quotation marks   | `8d09c5c` |

Earlier the same day, also on `dev`: `75c064f` (header logo mark only), `20b5ecd` (slideshows only show projects with a photo),
`0ea6d30` (the /projects subtitle in gold), `2b13fe1` (stronger local shade behind the heading block).

## Per-commit verification run

No clean-clone, per-commit verification run was started in this session, so there is no result to add. The earlier run (in the
previous part of the session, commits up to `7697647`) passed on all ten commits. The five commits above were each checked and built
in the working tree, not re-built one by one in a clean clone (that takes longer than the 3 minutes allowed).

## Part A: opening +20% and nav links (`3f2052f`)

- **Files:** `components/javor-sped-intro/javor-sped-intro.css`, `components/Navbar.tsx`, `docs/design-brief.md`.
- **Opening:** `--wm` from `clamp(34px, 4.6vw, 60px)` to `clamp(40.8px, 5.52vw, 72px)`. Everything else follows from it.
  - Wordmark at 1440 and 1920: 60 to 72px (410 to 492px wide). HOLDING: 16.8 to 20.2px.
  - Phone: 34 to 40.8px (232 to 279px wide); HOLDING 9.5 to 11.4px. One line at 360px.
- **Links:** grid `auto 1fr auto`, links centred between the logo and the button. Shift from the page centre: 1024: 109px left;
  1280, 1440, 1920: 124px left. Equal space each side (134px at 1024, 223px above), no overlap. The 390 menu is untouched.
- **Decisions:** none beyond the brief.

## Part B: /projects subtitle (`e6e04bf`)

- **Files:** `app/globals.css`, `app/projects/page.tsx` (fallback header), `components/projects/ProjectsHero.tsx`,
  `components/ui/HeroSlideshow.tsx`, `docs/design-brief.md`.
- **Gap:** the ink-to-ink gap was already 8.1px at 1440 and 8.7px at 1920 (the measured gap is from the h1's descenders to the top of
  the subtitle's letters); it was 4.4px under 760px screen height because of a 4px override. Now 8px on every height (8.1 to 8.7px).
- **Decision:** the subtitle was over the roof of Радовиш Twins at 1280 and 1440. Moving it up could not fix that (the roof is at
  about 20.7% of the picture), so the photo of a slide whose roof is higher than the heading block is let down just far enough
  (`--hero-roof`, `--hero-dy`). Only Радовиш Twins moves: 57px at 1280×720, 36px at 1440×900, 4px at 1920×1080. The roof is then 14
  to 16px below the subtitle. Дојрански Рај is an aerial view with no sky; its subtitle is over ground, not the building.
- **Shade (2b13fe1):** unchanged, same position. Gold line over the brightest pixel behind it, 1440: City Center 5.5:1, Дојрански Рај
  4.9:1, Радовиш Twins 7.7:1; 1280: 7.5, 5.9, 7.7.
- **Fallback header:** the same 8px gap.
- Screenshot: `b-projects-city-center-1440.jpg`.

## Part C: City Center (`82dac32`)

- **Files:** `app/development/page.tsx`, `app/development/[buildingId]/page.tsx`, `components/Masterplan.tsx`,
  `components/project/BuildingCard.tsx`, `components/project/ProjectPhotoGallery.tsx`, `components/floor-picker/FloorPickerSection.tsx`,
  `components/floor-picker/floor-picker.css`, `docs/design-brief.md`.
- **«Изберете зграда» at 1440:** plan 836 to 960px, card column 340 to 392px, marker dot 36 to 42px (hit area 44 to 52px), 01–06
  buttons 48×44 to 56×52, photos button 44 to 52px tall. The plan keeps 16:9 and the markers stay on the same percentages.
- **Floor picker:** rows 46 to 54px, list 360 to 425px wide, floor plan frame 632 to about 750px. Cream, tokens `--fp-*`, on every
  picker (a building, Дојран, the project pages). Contrast 6.2:1 or better. Heading: `id="izberete-kat"` and `scroll-mt-(--nav-h)`;
  the intro block's top padding is now `calc(var(--nav-h) + 24px)`.
- **Decisions:** the section container is 1448px wide, so its left edge is at 32px at 1440 and no longer lines up with the other
  sections' 120px. The picker's grid ratio is 0.78fr / 1.22fr to give the plan room.
- Screenshot: `c-floor-picker-1440.png`. The opening: `a-opening-1440.png`.

## Task 8: apartment page (`29d00cc`)

- **Files:** `app/development/apartment/[id]/page.tsx`, `components/apartment/apartment.css` (new),
  `components/apartment/PlanEnlarge.tsx`, `types/index.ts`, `data/plans.ts`, `data/generate.ts`, `data/net-area.test.ts` (new),
  `docs/design-brief.md`.
- **Panel, in order:** ВКУПНА ПОВРШИНА and the total; ПОВРШИНА and ТЕРАСА in one row with a 1px line between; ТИП, БАЊИ, КАТ; СОБА ПО СОБА
  (indoor rooms only: name left, m² right, never wraps); the button and the phone line. СОБИ is gone. The separate «Простор, соба по
  соба.» section is gone. Floor plan and «Зголеми ја основата» are kept.
- **Cream:** the page is on Травертин (`.on-light`), Оникс text, Бронза labels, lines and button, row lines Оникс at 12%, the plan
  card has a 1px Бронза border at 35%. Header and footer stay dark.
- **Data:** new field `netArea` (interior area). Until the company's own value comes it is the total less the terrace, with a comment
  in `types/index.ts`. **All 221 apartments use the computed value:** 207 City Center, 7 Станбена куќа and 7 Дојрански Рај (the last
  two projects are sample data). 13 City Center apartments have no terrace (so their `netArea` is the total):
  `b03-f2-12, b03-f3-18, b03-f4-24, b03-f5-30, b03-f6-36, b05-f1-3, b05-f2-7, b05-f3-11, b05-f4-15, b05-f5-19, b05-f6-23, b06-f4-34,
b06-f6-54`. Two City Center apartments whose rooms do not add up to the drawing's total, so their `netArea` and room list differ
  by a few m²: `b02-f1-4` (119,20 vs rooms 125,20) and `b05-f1-4`. The word «пример» is not on the page any more (the old line under
  the plan that used it is gone).
- **Measured, on the cream:** labels 6.2:1, numbers and text 16.4:1, button 6.2:1, phone line 6.1:1, heading 16.4:1, eyebrow 6.2:1.
- **Checked** (b01-f1-1, b03-f2-12, b01-f6-26 and stanbena-kukja-f1-2, at 1440 and 390): the order 1–6, the numbers from the data,
  m² never wraps, no old section, the cream page, the plan card visible, no horizontal overflow, no console errors.
- **Decisions:**
  - `area` in the real data already includes the terrace (rooms add up to it in 205 of 207), so the total is `area`, ПОВРШИНА is
    `area − terrace`.
  - For the sample apartments the generator now makes the indoor rooms add up to the net area (before, `area` was the interior and
    the terrace came on top).
  - A terrace-less apartment shows ПОВРШИНА alone across the row.
  - Orientation is not in the target panel, so it is no longer shown.
  - The button is its own Бронза style (`.apt-cta`), not the site's foil primary, whose gold sheen shows on touch screens.
  - The «Основа» tag on the plan keeps its dark chip with gold text.
  - The old note «Основата е пример…» is removed; only «Основата … ќе биде додадена.» stays, for a plan not yet there.
  - The panel's sticky offset and the top padding use `--nav-h`.
- Screenshots: `task8-apartment-1440.png`, `task8-apartment-390.png`.

## Task 9: «Во што веруваме» (`8d09c5c`)

- **Files:** `components/home/Manifest.tsx`, `components/home/ManifestStage.tsx` (new, a small client component),
  `components/home/ManifestText.tsx`, `app/globals.css`, `docs/design-brief.md`.
- **What it does:** when 45% of the section is on screen (IntersectionObserver, once, also on touch) the marks fade in (1.6s) and
  glide 36px in from the sides; a 110px Бронза line (45%) grows from each (1.4s, after 0.8s); the eyebrow fades in; each word rises
  out of its own line (1.3s, 22ms apart, from 0.7s); a light sheen passes over the marks (2.6s, from 1.6s); the signature comes
  last. Reduced motion, no scripts, or no IntersectionObserver: everything is visible as the server sends it. The section is armed
  only by the script, so nothing stays invisible if the script fails. A section already on screen at load is not armed.
- **Kept:** the text, font, colours and section; the scroll-linked grey-to-dark colouring of the words still works (the words are now
  wrapped one level deeper).
- **Checked:** at 1440, 1280, 1180 and 390 the marks are inside the window (1440: left mark x 156 to 239, right mark x 1201 to 1284), the
  animation plays once (scrolling away and back changes nothing), no horizontal overflow, no console errors; with reduced motion
  and without scripts the section is fully visible; the marks and the lines are `aria-hidden`, the quote is plain text.
- **Decisions:**
  - Marks beside the quote from 1160px, not 900px: the marks need 204px on each side of the 720px quote, and at 1100px the left mark
    was cut by 14px. Under 1160px they sit above and below the quote.
  - The marks and their offsets follow the `.type-up` scale (200px becomes 240px at 1440; 110 becomes 132px on a phone).
  - The lines sit 50px (left) and 60px (right) outside the quote, a little further than the sample CSS, so they do not touch the first
    and last words.
  - The signature starts after the last word has risen plus 1.6s.
  - The sheen's two light tints are written as hex in the CSS, as given (the hex lint rule covers TypeScript only).
- Screenshots: `task9-manifest-1440.png`, `task9-manifest-390.png` (after the animation). I could not capture the sheen itself in a
  still frame.

## Not done / to look at

- No clean-clone per-commit verification (see above).
- Task 9: the sheen and the timing were checked by their CSS and by states at 1.2s and 8s, not frame by frame by eye.
- Part C: the 1448px sections no longer line up on the left with the rest of the page at 1440; say if you want the heading kept on the
  page's 120px edge.
- `lib/gallery.*`, `.agents/` and `.codex/` were not touched; they are still untracked.
