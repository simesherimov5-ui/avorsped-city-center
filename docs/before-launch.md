# Before launch

The site must not go live until every item under "Blocking" is done. Tick them off in the pull request that closes them. Where the content comes from the client, `docs/content-needed.md` says which file and field it goes into.

## Blocking

- [ ] **Sending bookings.** The form posts to `app/api/booking/route.ts`, which checks the booking again and e-mails it (area range first) through Resend. It needs three environment variables on the host: `RESEND_API_KEY`, `BOOKING_TO_EMAIL` (several addresses separated by commas) and `BOOKING_FROM_EMAIL` (a sender on a domain verified in Resend). Without them a production build answers 503 and the form tells the visitor to phone, so nothing is lost silently. Not done yet: nothing is stored besides the e-mail (no database), and there is no rate limit or spam check on the route. Test one real booking from a normal visit and one from a project page before launch.
- [x] **Map tiles.** Closed by the redesign: the map on Контакт and on the development page is now a drawing of the site's own (`components/location-map/LocationMap.tsx`), so there are no tiles, no provider and no key to choose.
- [ ] **Map pin / real entrance.** `companyInfo.coordinates` in `data/index.ts` points at Global Trade Center on Ленинова (from OpenStreetMap). Confirm it is the entrance of the sales office.
- [ ] **B1 — Completed projects contradict themselves.** The homepage hero says "5 завршени проекти" and "540+ изградени станови", but the "Завршени проекти" page says there is no completed project yet, and the "Завршено" filter on Проекти is empty. Needs the completed projects (name, year, place, photo). Until then nothing is removed.
- [ ] **B2 — Phone and e-mail look like placeholders.** `+389 2 3123 456` (footer, Контакт, apartment pages) uses the Skopje prefix, while the Дојрански Рај page shows `071/333-088`. Needs the real phone and e-mail, kept in ONE config (`companyInfo`) and used everywhere, including the Дојрански Рај specifications.
- [ ] **B3 — Дојрански Рај numbers.** The project says 30 apartments, its four floor pages add up to 7, and every floor page only says "Наскоро". Needs the real unit list, or the floor pages hidden until it exists.
- [ ] **B4 — City Center progress.** The project shows "Конструкција во тек · 90%, Фасада следно" while buildings 01–02 are at "Внатрешно доуредување" and 03–04 at "Фасада". Needs the real phase of each building; the project-level phase is then derived from them. Also reword "Статусот на секој стан … се ажурира во реално време" to "Последно ажурирање: <date>" unless the data becomes live.
- [ ] **B5 — Apartment data.** The apartments, areas and plans of City Center (all six buildings) are the architect's, but their statuses are all "available" for now: send the real status of each. The other projects' apartments are generated mock data. Confirm or replace them before launch.
- [ ] **Public address.** `metadataBase`, the sitemap, canonical links and share images need the public address (no custom domain yet). Set `NEXT_PUBLIC_SITE_URL` in Vercel; until then they use Vercel's own address.
- [x] **Google map cookies.** Closed by the redesign: the Google embed is gone. The page only links to Google Maps (a plain link that opens in a new tab), so nothing of Google's loads on the site.
- [ ] **Google map on the City Center page.** The "Локација" section embeds the real Google map (with a pin that drops onto it), so Google content loads there again. Mention it in the privacy policy (and decide whether a consent step is needed) before launch.
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
- [ ] The real City Center construction phase and percent, and the Дојрански Рај data (see the TODOs in `data/index.ts`).
- [ ] The final name for "Станбена Куќа" (its address is `/projects/stanbena-kukja`; the old `/projects/vista-heights` already redirects to it permanently).
