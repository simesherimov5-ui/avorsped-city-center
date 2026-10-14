# Claude Code Prompt — Homepage ending "Стакло" (unattended)

The last section of the homepage loses its photo. In its place: the logo building drawn in thin gold
lines, with a frosted glass panel in front of it holding the text and the buttons. When the section
scrolls into view the building builds itself from the ground up, the glass arrives, then the text.

The reference file is already in the project: `javor-sped-complete/reference/kraj-staklo.html`.
Nothing to copy by hand.

Copy everything below the line into Claude Code.

---

```
Replace the last section of the homepage (the dark "Следен чекор" block with
the photo behind it, at the end of app/page.tsx) with the new ending "Стакло".
I am away and I will not check anything.

Reference: javor-sped-complete/reference/kraj-staklo.html. Open it at 1440px
and 390px; the "Повтори" button in the corner replays the entrance (the
button is only in the reference, not part of the section). It is plain
CSS/JS; rebuild it with our stack. The numbers below are the source of truth;
the reference shows how they look together.

═══════════════════════════════════════
HOW TO WORK
═══════════════════════════════════════
- Do not stop, do not ask me anything, do not wait for an OK. When something
  is unclear, choose the option closest to this message, write one line about
  it under "Decisions and open issues", and carry on.
- This message approves the plan. Files: app/page.tsx, one new component
  components/home/ClosingGlass.tsx with its CSS file next to it, and
  docs/design-brief.md. If you need another file, use it and list it.
- Work on the branch that is checked out now. Keep uncommitted changes that
  are not yours and build on top of them.
- ONE commit, "Homepage ending: glass panel over the building mark". Do not
  push, no pull request.
- Not allowed: new dependencies, new colours (tokens from app/globals.css
  only; every shade below is a token at an opacity or two tokens mixed with
  color-mix), changes to any other section or shared component, anything
  under public/ (the old photo file stays where it is).
- Add a row to the decision log in docs/design-brief.md:
  "2026-10-09 · Homepage ending without a photo: a glass panel over the
  building mark. Blur, one soft shadow and one soft gold glow are allowed in
  this one section · Approved by: Sime".
- Final message, short: what changed, then "Decisions and open issues".

═══════════════════════════════════════
1. WHAT GOES AWAY
═══════════════════════════════════════
In the final CTA section of app/page.tsx: the photo layer (ParallaxImage,
Media, the dark overlay), the CTA_IMAGE constant, the ScrollReveal wrapper
around this section, and every import that is unused afterwards. The other
sections of the page stay exactly as they are.

═══════════════════════════════════════
2. STRUCTURE
═══════════════════════════════════════
A <section> on Оникс, aria-labelledby its heading, overflow hidden. Three
layers stacked in the centre, back to front:
  a) the glow        decorative, aria-hidden
  b) the building    decorative, aria-hidden
  c) the glass panel the real content
Desktop: min-height min(760px, 100svh), padding 72px 20px. All three share
one grid cell and are centred in it.

═══════════════════════════════════════
3. THE BUILDING
═══════════════════════════════════════
- Use MARK_STROKES and MARK_VIEWBOX from lib/logo-mark (the same drawing as
  the opening and BuildingMark). Do not redraw it. Keep each stroke's own
  opacity.
- Height min(660px, 88svh), width auto.
- Thin lines: about 4px on screen at that height (set the stroke width in
  viewBox units; in the reference it is 1.5 in a 240-unit-tall viewBox). Do
  not use vector-effect: non-scaling-stroke, it breaks the drawing animation.
- Stroke paint: one linear gradient across the whole drawing (userSpaceOnUse,
  from the bottom-left corner to the top-right): Бронза at 0, the logo gold
  (--color-brass) at 40%, --color-brass mixed half-way with Травертин at
  100%. Set the stop colours in CSS so they come from the tokens.

═══════════════════════════════════════
4. THE GLOW
═══════════════════════════════════════
Behind the building: a box min(900px, 130%) wide, 3:2, filled with
radial-gradient(closest-side, --color-brass at 16%, transparent). No pointer
events. It exists so the glass has light to catch.

═══════════════════════════════════════
5. THE GLASS PANEL
═══════════════════════════════════════
- Width min(820px, 100%), padding 52px 64px 44px, content centred in a
  column with 22px gaps, corners 2px.
- Surface: Еспресо at 40%, backdrop-filter blur(10px) saturate(160%) (with
  the -webkit- prefix too).
- Edges: 1px Травертин at 7% all round; the TOP edge is --color-brass at 60%
  (gold light catching the glass).
- Shadow: 0 44px 80px -44px black at 90%.
- The building must stay visible through the glass as soft blurred gold
  lines, and its top and base must show sharp above and below the panel.

═══════════════════════════════════════
6. CONTENT (inside the panel, top to bottom)
═══════════════════════════════════════
1. Label "Следен чекор": the existing .eyebrow, in the accent.
2. <h2>: "Вашето следно поглавје започнува тука." WITHOUT the „ “ quote
   marks. "започнува тука." is italic in the accent (<em>). Playfair 400,
   clamp(30px, 3.5vw, 50px), line-height 1.1, letter-spacing −0.018em,
   text-wrap: balance.
3. The paragraph, same text as now. 17px, weight 400 (not 300: it sits on
   glass), line-height 1.65, Травертин at 84%, max-width 480px.
4. Buttons, side by side, 16px apart, 8px extra space above:
   <Button href="/contact" variant="primary" tone="dark" filled> and
   <Button href="/projects" variant="secondary" tone="dark">, same labels as
   now. In this section only, both shrink to scale(0.97) the instant they
   are pressed (:active, 100ms ease-out), without touching Button.tsx.
5. Phone and e-mail from companyInfo, as links exactly as now (tel:, mailto:),
   13px, weight 500, letter-spacing 0.06em, Травертин at 90%, a 3px dot
   between them, each link at least 44px tall.

═══════════════════════════════════════
7. THE ENTRANCE
═══════════════════════════════════════
Plays ONCE, when 40% of the section is on screen.
  0.00s  the frame of the building draws upward (0.9s); the centre line
         0.08s later (0.85s)
  0.30s  the floors draw from the ground up: the lowest pair first, each next
         pair 0.06s later; in a pair the right line starts 0.05s after the
         left; each line takes 0.5s. Order the strokes by their position, not
         by the delay field in MARK_STROKES (that one is for the opening).
  0.40s  the glow fades in (1.4s, ease-out)
  1.15s  the glass arrives (0.8s): opacity 0→1, scale 0.97→1 and the blur
         0→10px together
  1.45s  the five content rows rise in, 0.09s apart (0.7s each):
         opacity 0→1, translateY 14px→0
- Curve for everything except the glow: cubic-bezier(.22,1,.36,1).
- Lines draw with pathLength="1" and stroke-dashoffset 1→0.
- Plain CSS keyframes started by adding a class is enough (an
  IntersectionObserver, as in the reference). Use GSAP only if that is
  simpler in this codebase.
- The server HTML shows the finished section. The script hides the parts
  only when it is about to animate them, and only if the section is not
  already on screen at that moment; so with scripts off, or if the visitor
  lands at the bottom of the page, nothing is missing and nothing flashes.
- Nothing is locked while it plays: the buttons work from the moment they
  are visible.

═══════════════════════════════════════
8. PHONES (640px and narrower)
═══════════════════════════════════════
The building does not fit behind the panel, so it stands above it:
- Two rows: the building (height 230px, lines about 2px), then the panel,
  pulled up by 64px so it overlaps the base of the building.
- Section padding 56px 16px 64px, no min-height.
- Panel padding 36px 22px 30px, gaps 18px; paragraph 16px.
- Buttons stacked, full width, 12px apart. Phone and e-mail stacked, no dot.
- Same entrance, same timing.

═══════════════════════════════════════
9. ACCESSIBILITY
═══════════════════════════════════════
- prefers-reduced-motion: no entrance, the finished section at once; no
  press scale.
- prefers-reduced-transparency: the panel is solid Еспресо, no blur.
- prefers-contrast: more: solid Еспресо, no blur, border Травертин at 60%.
- Heading text against the panel: at least 4.5:1 at every point, also where
  a blurred gold line passes behind it.

═══════════════════════════════════════
CHECK IT YOURSELF
═══════════════════════════════════════
Look at each of these and fix what is wrong. Nothing here is for me.
1. Next to the reference at 1440px and 390px: the finished state matches.
2. Scroll down to the section on a fresh load: the order is building →
   glass → text, it plays once, and scrolling away and back does not replay.
3. Load the page already scrolled to the bottom: nothing flashes or stays
   hidden.
4. Reduced motion on: the finished section, no movement.
5. Tab reaches both buttons and both links; the focus ring is visible.
6. No horizontal scrolling at 360px. "ЗАКАЖИ КОНСУЛТАЦИЈА" fits on one line.
7. The company ticker and the footer below the section are unchanged.
8. `npm run check` and `npm run build` pass. Then commit.
```
