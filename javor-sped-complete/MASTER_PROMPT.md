You are working on the Exclusive Building / Јавор Шпед website (Next.js App Router,
project folder C:\Dev\projects\meridian, deployed on Vercel). This file lists
everything still to do, in order. Files you need are in this same folder
(`javor-sped-complete/`): `intro/`, `ticker/` and `reference/` (clickable HTML
mockups: open them in a browser to see the intended result).

═══════════════════════════════════════
HOW TO WORK
═══════════════════════════════════════
- FIRST: go through phases 1–9 below and tell me, for each one, whether it is
  already done, partly done or not started. Then start with the first one that
  isn't finished.
- Do ONE phase at a time. After each phase: show me screenshots (1440px and
  390px), wait for my OK, then commit with a clear message.
- Never invent content (company history, working hours, apartment data,
  construction phases). Ask me, and list everything you still need.
- Design rules everywhere: 3 colors only: paper #FAF8F5, ink #141414,
  gold #C9A45C (gold TEXT on paper uses #7A6136). Fonts: our existing serif for
  headings, Inter for text and buttons, IBM Plex Mono for numbers. Animate only
  opacity and transform. Respect prefers-reduced-motion in every animation.
- Each phase must also pass `npm run build` with no console errors.

═══════════════════════════════════════
PHASE 1: PROJECTS SLIDER (homepage)
═══════════════════════════════════════
The slider showing "City Center", "ВО ИЗГРАДБА", "ПОГЛЕДНИ ГО ПРОЕКТОТ".
- Full width, edge to edge (no side margins); about 72px of space under the navbar
- Height: clamp(380px, 28vw, 560px). Mobile (below 768px): 60vh (min 400px, max 520px)
- Images: object-fit cover, centred, buildings kept in frame
- The text block stays bottom-left, aligned with the page's content column
- Autoplay: next slide every 4 seconds, looping. Pause on hover, on keyboard
  focus and when the tab is hidden. Arrows, dashes and swipe restart the timer.
- The dashes are progress indicators: the active one fills with gold over 4s
- Slide change: 1.2s crossfade while the new image settles from scale 1.08 to 1;
  each image drifts from scale 1 to 1.05 during its 4 seconds
- Slide text animates in after the image (label, name, address, button; stagger 0.1s)
- Preload the next image; arrow keys work; real buttons with aria-labels

═══════════════════════════════════════
PHASE 2: HOMEPAGE OPENING INTRO
═══════════════════════════════════════
Files: `intro/JavorSpedIntro.tsx`, `intro/logo-mark.ts`,
`intro/javor-sped-intro.css`, `intro/preview.html`. Copy them to
`components/javor-sped-intro/`.

The sequence on a black screen (about 7 seconds):
1. Our logo loads inside a thin gold ring; the ring draws while a 000–100 counter runs
2. The logo fades and a bold gold "JS" rises into the ring
3. JS becomes JAVOR, then JAVOR-SPED (all bold, Inter 600)
4. The wordmark lifts away, then the page OPENS EXACTLY THE WAY IT OPENS NOW

Tasks:
- Find the transition that currently uncovers the hero when the loading screen
  finishes and describe it to me in one sentence. Replace the simple fade at
  the end of JavorSpedIntro.tsx (the `.intro-bg` opacity tween) with that exact
  transition: same movement, duration and easing.
- This is the ONLY load animation on the homepage. Remove the old loading
  screen and every other animation on the hero photo. Right now the photo
  appears, then appears AGAIN a moment later (on localhost AND on Vercel, so it
  is not React Strict Mode): find the cause and remove the second one. List
  every place that animates the hero image before changing anything.
- The hero photo must be loaded and visible under the black screen before it
  opens; after that it never fades, zooms or re-appears.
- Homepage only; once per session (every reload while developing); lock
  scrolling while it runs; use onReveal to start the hero text entrance.

═══════════════════════════════════════
PHASE 3: COMPANY TICKER (every page)
═══════════════════════════════════════
Files: `ticker/CompanyTicker.tsx`, `ticker/companies.ts`,
`ticker/company-ticker.css`. Reference: `reference/company-ticker-options.html`,
style "B · Quiet luxury". Copy them to `components/company-ticker/`.
- Render it in the shared layout as the LAST element of every page, directly
  below the footer. Remove any other ticker (hero, dark CTA section).
- 56px ink strip, small widely spaced letters, thin gold line separators,
  names fading at both edges, ~70s loop, pause on hover + a pause button
- `companies.ts` holds the 9 real company names. It is the ONE shared list;
  phase 6 uses it too.

═══════════════════════════════════════
PHASE 4: NAVBAR
═══════════════════════════════════════
- The navbar slides up out of view when the visitor scrolls DOWN (after ~160px)
  and slides back in as soon as they scroll UP (0.45s, smooth)
- Transparent over the homepage hero at the very top; solid ink once scrolled
  and on all other pages
- It never hides while the mobile menu is open or while a nav link has focus

═══════════════════════════════════════
PHASE 5: PAGE TRANSITION (curtain, about 2.8 seconds)
═══════════════════════════════════════
Reference: `reference/page-transition-options.html`, option "A · Curtain".
Match its look and timing. Use GSAP.
1. A full-screen ink panel rises from the bottom over the current page (0.9s, "power3.inOut")
2. The destination page's name appears in the centre in gold (Inter 13px,
   uppercase, letter-spacing .4em; fade + rise, 0.5s) and a 1px gold line draws
   out to 120px under it (0.6s)
3. The route changes while the screen is fully covered
4. Hold 0.45s; the name fades up and out (0.3s)
5. The panel continues up and off the top (0.9s), revealing the new page; its
   heading and content fade up as the panel clears

Rules:
- One <PageTransition> in the root layout plus a <TransitionLink> used by the
  navbar and by cards/buttons that go to other pages. The link starts the
  curtain, waits until the screen is covered, then calls router.push.
- Prefetch on hover/focus; if the new page isn't ready, keep the curtain down
- The navbar stays above the curtain; its gold underline slides to the clicked tab (0.6s)
- Ignore clicks during a transition; clicking the current page does nothing
- Browser back/forward: a quick 0.3s fade, not the curtain
- Scroll resets to the top while covered
- Never plays together with the homepage intro
- Mobile: same transition, 1.8s in total
- Keep all timings in one config object at the top of the component
- IMPORTANT (a bug I hit in the mockup): do not put a CSS percentage transform
  on the curtain and then animate yPercent with GSAP; set its start position
  with gsap.set instead, or it ends up stuck covering the page.

═══════════════════════════════════════
PHASE 6: "ЗА НАС" PAGE
═══════════════════════════════════════
Reference: `reference/whole-site-ideas-mockup.html` → tab "ЗА НАС" (tag 10).
Keep all existing text.

a) Values ("За што се залагаме": Квалитет, Сигурност, Иновација, Транспарентност)
   as framed cards in a 4-column grid, 24px gaps:
   - 1px border (ink at 12%), padding 40px 32px, no rounded corners, equal height
   - mono number 01–04 in gold-deep, a 32px gold line, the title (serif 26px),
     the description (ink at 70%)
   - small gold "L" corner marks top-left and bottom-right
   - hover: gold border, lift 4px, the gold line grows to 64px
   - cards fade up one after another on scroll; tablet 2 columns, phone 1

b) Stats (540+ изградени станови, 6 згради во изградба): a framed row with thin
   dividers; the numbers count up from 0 when scrolled into view

c) "Нашиот пат" timeline on an ink band:
   - a horizontal row of milestones on a gold line with gold dots; the year in
     IBM Plex Mono (30px, gold) and one short sentence under each
   - scrolls sideways when it overflows (drag / swipe), thin gold scrollbar;
     the line draws left to right and milestones fade up on scroll-in
   - milestones come from one config array. Only 1994 (founding) and the
     current City Center project are confirmed: ASK ME for the rest.

d) Directly BELOW the timeline, on the same ink band: "Дел од Јавор Шпед",
   the group's companies in boxes:
   - 3-column grid (9 companies = 3 × 3) with shared 1px gold-at-25% lines
     between boxes; each box 140px tall, a mono index 01–09 in gold and the
     name in paper (Inter 15px, uppercase, letter-spacing .2em)
   - Exclusive Building is highlighted: full gold border, gold name, a small
     label "ОВАА КОМПАНИЈА"
   - hover: gold-at-8% background, the name turns gold, a gold line draws across
     the bottom; boxes reveal in a diagonal wave on scroll
   - tablet 2 columns, phone 1 column (88px boxes)
   - names from the shared `companies.ts`; remove the old plain company tags

e) Section rhythm: 140px between sections on desktop, 72px on phones; each
   eyebrow gets a 40px gold line before it; headings reveal line by line.

═══════════════════════════════════════
PHASE 7: "КОНТАКТ" PAGE
═══════════════════════════════════════
Reference: `reference/whole-site-ideas-mockup.html` → tab "КОНТАКТ" (tags 12, 13).
Two columns on desktop, stacked on phones.

Left: guided booking form
- "ШТО ВЕ ИНТЕРЕСИРА?": Стан / Деловен простор / Паркинг
- "КОЛКУ СОБИ?": 1 / 2 / 3 / 4+ (only when "Стан" is selected)
- "ИЗБЕРЕТЕ ДЕН": the next 5 working days as tappable day cards (generated from
  today's date), then time buttons 10:00 / 12:00 / 15:00 / 17:00
- Име и презиме, Телефон (required), a "ЗАКАЖИ" button
- Selected choice: gold fill. Selected day: ink fill with gold text.
- Validate; show a confirmation with the chosen day and time; send it the same
  way the current contact form does (keep the existing backend/email)
- Arriving from an apartment or project page: pre-select the interest and
  include that apartment/project reference in the message

Right: a dark (ink) panel
- "ДИРЕКТНО": Телефон (tel:), Viber / WhatsApp (deep links), Е-пошта (mailto:),
  Работно време
- Under it, a real embedded map of the location (dark style if possible, gold pin)
- Use the contact details already on the site. ASK ME for working hours and the
  Viber/WhatsApp number.

═══════════════════════════════════════
PHASE 8: CONSTRUCTION PROGRESS (every project being built)
═══════════════════════════════════════
Reference: `reference/whole-site-ideas-mockup.html` → tab "ПРОЕКТИ" (tag 7).
- ONE reusable <ConstructionProgress /> component, shown on the page of EVERY
  project with status "во изградба" (never on finished or upcoming ones), and
  automatically on any future project with that status
- Title "Тек на изградба" / "Градбата, фаза по фаза"
- Five phases in a row: Темели → Конструкција → Фасада → Ентериер → Предавање
  - done: solid gold dot, "завршено"
  - current: gold ring with a soft glow, "во тек · X%"
  - upcoming: empty dot, "следно"; the last one shows the handover year
- A gold line fills from the left up to the current phase on scroll-in (1.6s)
- Data lives with each project (phases, current phase, percent, handover date,
  last-updated date) so it can be updated in one place; show "Ажурирано: <date>"
- On project CARDS in the projects list: a compact version, one thin progress
  bar with the current phase name
- Phone: phases stack vertically as a list with the same dots
- ASK ME for the real phase and percentage of each project.

═══════════════════════════════════════
PHASE 9: MOBILE VERSION OF THE WHOLE SITE (do this last)
═══════════════════════════════════════
Go through EVERY page and section at 390px (iPhone), 360px (small Android) and
768px (tablet). First take screenshots and list the problems, then fix them.

Layout
- No horizontal scrolling anywhere; side padding 20px on phones, 32px on tablets
- Multi-column sections stack into one column (image first, then text)
- Section gaps reduced to 64–80px on phones

Navigation
- Phone navbar: logo left, menu button right; a full-screen menu (ink
  background, gold accents) with large links and the consultation button
- Every tap target is at least 44×44px

Text
- Body text at least 16px; headlines use clamp() so they never overflow or
  break mid-word (check the long Macedonian headlines)
- Reduce wide letter-spacing on headlines so lines don't wrap badly

Buttons and forms
- Buttons at least 48px tall; two side-by-side buttons stack, full width
- Form fields 16px text (prevents iOS zoom), clear labels, the right keyboard
  for phone and email; phone numbers and emails are tappable links

Images and animation
- object-fit cover with sensible crops; smaller images on phones (next/image sizes)
- Lighter animations on phones: no parallax, nothing that only works on hover
- Use 100dvh instead of 100vh for full-height sections

Check specifically at 360px: the opening intro, the projects slider, the
curtain transition, the company ticker, the За нас cards/timeline/company
boxes, the Контакт form, the construction progress, apartment cards and filters.

Finish with: before/after screenshots of every page at 390px, a Lighthouse
mobile score (Performance and Accessibility) for the homepage, and a list of
everything you still need from me.
