# Before launch

The site must not go live until every item here is done. Tick them off in the pull request that closes them.

## Blocking

- [ ] **Sending bookings.** `components/contact/send-booking.ts` only waits: no booking reaches the sales team, yet the confirmation promises a call back. Wire it to the chosen service (Web3Forms) and test one real booking from a normal visit and one from an apartment page.
- [ ] **Map tiles.** `components/contact/ContactMap.tsx` uses Esri's dark gray tiles because CARTO "Dark Matter" answers "API KEY REQUIRED" without a key. Switch to CARTO with a key (or another provider whose terms cover a company website) and keep the attribution visible.
- [ ] **Map pin / real entrance.** `companyInfo.coordinates` in `data/index.ts` points at Global Trade Center on Ленинова (from OpenStreetMap). Confirm it is the entrance of the sales office.

## Content from the client

- [ ] Viber / WhatsApp number (`companyInfo.messengerNumber`). While it is empty the row is hidden.
- [ ] Timeline milestones between 1994 and today, with a photo for each (`companyTimeline` in `data/index.ts`).
- [ ] Hero photo (or a short silent video), values photo(s) and closing photo for За нас (`app/about/page.tsx`).
- [ ] Which words of the story are set in gold (`STORY_GOLD` in `app/about/page.tsx`).
- [ ] A founder / management quote with name and role, or confirmation to leave the quote band out.
- [ ] Public holidays for `CLOSED_DATES` in `components/contact/booking-config.ts`.
- [ ] Spelling of the nine company names (`components/company-ticker/companies.ts`).
- [ ] The real City Center construction phase and percent, and the Дојрански Рај data (see the TODOs in `data/index.ts`).
