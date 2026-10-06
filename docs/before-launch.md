# Before launch

The site must not go live until every item under "Blocking" is done. Tick them off in the pull request that closes them. Where the content comes from the client, `docs/content-needed.md` says which file and field it goes into.

## Blocking

- [ ] **Sending bookings.** `components/contact/send-booking.ts` only waits: no booking reaches the sales team, yet the confirmation promises a call back. Wire it to the chosen service (Web3Forms) and test one real booking from a normal visit and one from an apartment page.
- [ ] **Map tiles.** `components/contact/ContactMap.tsx` uses Esri's dark gray tiles because CARTO "Dark Matter" answers "API KEY REQUIRED" without a key. Switch to CARTO with a key (or another provider whose terms cover a company website) and keep the attribution visible.
- [ ] **Map pin / real entrance.** `companyInfo.coordinates` in `data/index.ts` points at Global Trade Center on Ленинова (from OpenStreetMap). Confirm it is the entrance of the sales office.
- [ ] **B1 — Completed projects contradict themselves.** The homepage hero says "5 завршени проекти" and "540+ изградени станови", but the "Завршени проекти" page says there is no completed project yet, and the "Завршено" filter on Проекти is empty. Needs the completed projects (name, year, place, photo). Until then nothing is removed.
- [ ] **B2 — Phone and e-mail look like placeholders.** `+389 2 3123 456` (footer, Контакт, apartment pages) uses the Skopje prefix, while the Дојрански Рај page shows `071/333-088`. Needs the real phone and e-mail, kept in ONE config (`companyInfo`) and used everywhere, including the Дојрански Рај specifications.
- [ ] **B3 — Дојрански Рај numbers.** The project says 30 apartments, its four floor pages add up to 7, and every floor page only says "Наскоро". Needs the real unit list, or the floor pages hidden until it exists.
- [ ] **B4 — City Center progress.** The project shows "Конструкција во тек · 90%, Фасада следно" while buildings 01–02 are at "Внатрешно доуредување" and 03–04 at "Фасада". Needs the real phase of each building; the project-level phase is then derived from them. Also reword "Статусот на секој стан … се ажурира во реално време" to "Последно ажурирање: <date>" unless the data becomes live.
- [ ] **B5 — Apartment data.** Prices, areas and statuses are generated mock data (except Building 06, floor 3). Confirm or replace them before launch.
- [ ] **Public address.** `metadataBase`, the sitemap, canonical links and share images need the public address (no custom domain yet). Set `NEXT_PUBLIC_SITE_URL` in Vercel; until then they use Vercel's own address.
- [ ] **Google map cookies.** The map on the development page now loads only after a click, but Google still sets its cookies at that moment. Decide with the lawyer whether the line under the button is enough or a consent step is needed (goes with the privacy policy).
- [ ] **Privacy policy.** The form collects a name and a phone number. The page structure is ready but unpublished (`components/privacy/privacy-content.ts`): it needs the text, then it must be linked from the footer and mentioned under the form.

## Should be done soon after launch

- [ ] **Slow first view on phones.** In the lab test (Lighthouse, mobile, throttled) the first text appears after 4.5–5.8 s on most pages, on a computer after 1–1.5 s. Cause: entrance animations (`components/ui/Reveal.tsx`, Framer Motion) are written into the page as invisible and only shown once the scripts have loaded. Fix: show above-the-fold text in the server HTML and animate with CSS. A design-neutral change, but it touches every page, so it needs its own pull request.
- [ ] **Unused video.** `public/videos/city-center-hero.mp4` (39.7 MB) is not used by any page. Delete it from `public/` or compress it before it is ever used.
- [ ] **No script policy.** The security headers (`next.config.ts`) cover framing, referrer, content type, browser features and HTTPS, but not `script-src`: that needs a per-request nonce, which would stop the pages being served ready-made. Revisit when the booking form or any third-party script is added (Web3Forms, analytics). Add `includeSubDomains` to HSTS only after checking that no sub-domain of the final domain is served over plain HTTP.
- [ ] **Safari and Firefox.** Only Chrome was available for testing. Look at the home, apartment and Контакт pages in Safari (iPhone) and Firefox before launch.
- [ ] **Entrance animation on За нас.** The unread words of the story are now shown at 50% (gold words 75%) instead of 25%, so they pass the contrast rule. Say if the effect should be stronger and the contrast rule relaxed instead.

## Content from the client

- [ ] Viber / WhatsApp number (`companyInfo.messengerNumber`). While it is empty the row is hidden.
- [ ] Timeline milestones between 1994 and today, with a photo for each (`companyTimeline` in `data/index.ts`).
- [ ] Hero photo (or a short silent video), values photo(s) and closing photo for За нас (`app/about/page.tsx`).
- [ ] Which words of the story are set in gold (`STORY_GOLD` in `app/about/page.tsx`).
- [ ] A founder / management quote with name and role, or confirmation to leave the quote band out.
- [ ] Public holidays for `CLOSED_DATES` in `components/contact/booking-config.ts`.
- [ ] Spelling of the nine company names (`components/company-ticker/companies.ts`).
- [ ] The real City Center construction phase and percent, and the Дојрански Рај data (see the TODOs in `data/index.ts`).
- [ ] The final name for "Станбена Куќа" (its address is still `/projects/vista-heights`); the old address then redirects permanently.
