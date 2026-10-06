# Content needed from the client

Everything the site is still waiting for. Nothing here may be invented: until the client sends it, the site either leaves the section out or shows what it already has. Each entry says where it goes (file and field), what format is needed, and an example of the _shape_ of the answer. **The examples show format only: they are not facts about the company.**

Photos and videos go in `public/` (ask first, per CLAUDE.md). Photos: JPG, sRGB, no text or logos burned in, one subject per photo. File size is not a concern: the site resizes every photo, but send the largest original available. The sizes below are the minimum that stays sharp on a large screen.

The items that stop the site from going live are in `docs/before-launch.md`; this file is the shopping list behind them.

---

## 1. Company facts

### 1.1 Completed projects (before-launch B1)

- **Where:** `projects` in `data/index.ts` (one entry per project, `status: "completed"`); the "Завршени проекти" page and the "Завршено" filter on Проекти fill themselves from it.
- **Needed per project:** name, town and street, year of completion, number of apartments, 2–3 sentences of description, one hero photo and 4–12 gallery photos (with a short description of each for the `alt` text).
- **Format:** name up to 40 characters; description 200–400 characters; hero photo landscape at least 2400 × 1500 px; gallery photos at least 1600 px on the long side.
- **Example shape:** `Name: <project name> · Place: <street, town> · Year: <yyyy> · Apartments: <number> · Description: <2–3 sentences>`
- **Also decide:** the homepage numbers "5 завршени проекти" and "540+ изградени станови" (`companyStats` in `data/index.ts`) are only true if these projects exist. Send the real totals, or say to drop the two figures.

### 1.2 Phone and e-mail (before-launch B2)

- **Where:** `companyInfo.phone` and `companyInfo.email` in `data/index.ts` (the one place; footer, Контакт, apartment pages and the search-engine data all read it). The Дојрански Рај specifications also show a number: the `dojranski-raj` entry of `projects` (`specifications`, label "Контакт", today `071/333-088`).
- **Format:** phone in international form with spaces, e-mail as a single address.
- **Example shape:** `+389 XX XXX XXX` and `name@company-domain`.
- **Today:** `+389 2 3123 456` (a Skopje prefix) looks like a placeholder, and `info@javorsped.mk` is unconfirmed. The Дојрански Рај page shows a different number.

### 1.3 Viber / WhatsApp number

- **Where:** `companyInfo.messengerNumber` in `data/index.ts`. While it is empty the row is hidden.
- **Format:** international form. **Example shape:** `+389 7X XXX XXX`.

### 1.4 Opening hours

- **Where:** `companyInfo.hours` in `data/index.ts`.
- **Format:** one line, 60 characters at most. **Example shape:** `Пон–Пет 09:00–17:00, Саб 09:00–13:00`.
- **Today:** the current line has not been confirmed by the client. The booking form's time slots (`components/contact/booking-config.ts`) follow the same hours, so send them together.

### 1.5 Public holidays the office is closed

- **Where:** `CLOSED_DATES` in `components/contact/booking-config.ts`.
- **Format:** a list of dates, `yyyy-mm-dd`, for the next 12 months. **Example shape:** `2026-12-25`.

### 1.6 Sales office entrance (map pin)

- **Where:** `companyInfo.coordinates` in `data/index.ts`.
- **Format:** latitude and longitude, or just "drop a pin" in Google Maps and send the link. **Example shape:** `41.4390, 22.6390`.
- **Today:** the pin is on the building (Global Trade Center), not the office entrance.

### 1.7 Spelling of the company names

- **Where:** `COMPANIES` in `components/company-ticker/companies.ts` (used by the ticker at the bottom of every page and the circle on За нас).
- **Format:** the nine names exactly as they are registered, in Cyrillic or Latin as the company writes them.

### 1.8 Company descriptions and website links

- **Where:** each entry of `COMPANIES` in `components/company-ticker/companies.ts`: the optional fields `description` and `url`. The circle on За нас shows them in its centre when a company is selected. Until a company has a description, its centre shows only the number and the name; without a `url` there is no link.
- **Format:** description: plain text, **at most 280 characters** (longer text is cut at a word and ends with "…"), 2–3 sentences in the present tense, what the company does and its role in the group. Link: the full address with `https://`, opens in a new tab.
- **Example shape:** `description: "<What the company does. Its role in the group.>"` and `url: "https://<company-website>"`.
- **For:** all nine companies (Exclusive Building is first in the circle and carries the tag "Оваа компанија").

---

## 2. За нас (About)

### 2.1 Hero photo or short video

- **Where:** `HERO_PHOTO` in `app/about/page.tsx`.
- **Format:** photo, landscape, at least 2400 × 1350 px (16:9); or a silent video, MP4 (H.264), 10–20 seconds, 1920 × 1080, under 5 MB, with no important detail in the outer 10%.
- **Shows:** people or work of the group (a site, a team, a building going up), not a render. **Example shape:** `<site name>, <month year>, <what is in the picture>`.

### 2.2 Values photos (one per value)

- **Where:** `VALUES_PHOTOS` in `app/about/page.tsx`. One photo is supported; four photos are supported and then change as the visitor reads from one value to the next.
- **Format:** portrait 4:5, at least 1600 × 2000 px.
- **Order:** Квалитет, Сигурност, Иновација, Транспарентност (the four values in `companyInfo.values`).

### 2.3 Closing photo

- **Where:** `CLOSING_PHOTO` in `app/about/page.tsx`.
- **Format:** landscape, at least 2400 × 1350 px; calm, with space for a line of text over it.

### 2.4 Milestones between 1994 and today

- **Where:** `companyTimeline` in `data/index.ts` (today only 1994 and 2026).
- **Needed per milestone:** the year, one short sentence, one photo.
- **Format:** sentence up to 80 characters, in the past tense; photo 4:5 portrait or 4:3 landscape, at least 1200 px wide.
- **Example shape:** `<yyyy>. <What happened, one sentence.>`

### 2.5 Which words of the story are set in gold

- **Where:** `STORY_GOLD` in `app/about/page.tsx`.
- **Format:** an exact phrase from the story paragraph (`companyInfo.story`), two to four words.
- **Today:** «диверзифицирана холдинг група». Confirm or replace.

### 2.6 Management quote (optional)

- **Where:** the marked place in `app/about/page.tsx` (the quote band is left out until it exists).
- **Needed:** the quote, the person's name and role, and a portrait photo if wanted.
- **Format:** quote up to 200 characters; portrait 1:1, at least 800 × 800 px. **Example shape:** `„<quote>" — <name>, <role>`.
- **Or:** confirm that there should be no quote.

---

## 3. City Center

### 3.1 Construction progress (before-launch B4)

- **Where:** `construction` in the `city-center` entry of `projects` in `data/index.ts`, and the status of each building in `data/generate.ts` (`status` on each building).
- **Needed per building (01–06):** the real phase (planning, foundation, structure, exterior, interior, completed) and the date it was last checked; for the project: expected handover date.
- **Format:** phase as one of the six words, dates `yyyy-mm-dd`. **Example shape:** `Building 03: exterior, checked <yyyy-mm-dd>`.
- **Today:** the project says 90 % "Конструкција во тек" while buildings 01–02 are at interior and 03–04 at exterior; nothing is dated.

### 3.2 Apartment data (before-launch B5)

- **Where:** `data/generate.ts` (generated mock data; only Building 06, floor 3 is real).
- **Needed for each apartment:** building, floor, number, area (m²), balcony area, rooms, orientation, price in euros (and whether it includes VAT), status (available, reserved, sold).
- **Format:** a spreadsheet, one row per apartment. **Example shape:** `B02 | 4 | 407 | 62,4 | 6,0 | 2 | юг | <price> | достапен`.
- **Also:** which of the prices may be shown on the website at all.

### 3.3 Floor plans and photos for the other buildings

- **Where:** `lib/assets.ts` (floor plans by apartment) and `public/images/floorplans/`.
- **Format:** floor plan as PNG or JPG, at least 2000 px on the long side, white or transparent background; one image per apartment type, or one per floor. Room photos or renders in landscape, at least 1600 px wide, with a description of the room.

### 3.4 360° tours and room videos

- **Where:** `tour` on an apartment (`data/generate.ts`) and the room `video` / `poster` entries (`RoomTourRoom` and `FloorPlanExplorerData` in `types/index.ts`; the Станбена Куќа ones are in `data/index.ts`).
- **Format:** video MP4 (H.264), up to 15 seconds, 1280 × 720, under 600 KB each, no sound; a still frame (JPG, 1280 × 720) for each. Sections without a tour or room list stay hidden.

### 3.5 Map link for the project

- **Where:** `development.mapQuery` in `data/generate.ts`.
- **Format:** the street address as it should be searched, or a Google Maps link to the building site.

---

## 4. Дојрански Рај (before-launch B3)

- **Where:** the `dojranski-raj` entry of `projects` in `data/index.ts` and `dojranFloors` in `data/dojran.ts`.
- **Needed:** the real number of apartments (the project says 30, the floor pages list 7), and per apartment: floor, number, area, price, status, one floor plan, 4–10 photos or renders.
- **Format:** spreadsheet row per apartment as in 3.2; photos landscape at least 1600 px wide.
- **Until then:** each floor page only says "Наскоро"; say whether to hide the floor pages.

## 5. Станбена Куќа

- **Where:** the `vista-heights` entry of `projects` in `data/index.ts` (name `Станбена Куќа`, address `/projects/vista-heights`).
- **Needed:** the final project name, expected completion, current phase, and the 7-apartment list as in 3.2.
- **Format:** name up to 40 characters; the old address then redirects permanently to the new one.

---

## 6. Legal and sending

### 6.1 Privacy policy

- **Where:** `privacyPolicy` in `components/privacy/privacy-content.ts`, then set `PRIVACY_PUBLISHED` to `true`.
- **Needed:** the full text written or approved by the company's lawyer: who is responsible for the data (name, address, e-mail), what is collected (name, phone, chosen apartment, preferred time), why, how long it is kept, who receives it, how to ask for deletion.
- **Format:** sections, each a heading and one to four paragraphs; the date of the last change as shown to visitors. **Example shape:** `Heading: <e.g. Какви податоци собираме> · Paragraph: <text>`.

### 6.2 Where the bookings go

- **Where:** `components/contact/send-booking.ts` (separate follow-up).
- **Needed:** the e-mail address(es) that receive a booking, the Web3Forms access key (created by the company), and who answers within what time (the confirmation text promises a call back).
- **Do not paste the key into chat or into a commit:** it goes into an environment variable.

### 6.3 Map provider

- **Where:** `components/contact/ContactMap.tsx` (separate follow-up).
- **Needed:** a decision on the map provider and its key (CARTO, or another whose terms cover a company website).

### 6.4 Public address

- **Where:** the environment variable `NEXT_PUBLIC_SITE_URL` in Vercel (canonical links, sitemap, share images).
- **Needed:** the domain the site will live on, e.g. `https://<domain>`.
