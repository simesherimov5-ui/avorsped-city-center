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

- **Where:** the marked place in `app/about/page.tsx` (a band with the company's line «Делата зборуваат за нас…» stands there until a real quote exists).
- **Needed:** the quote, the person's name and role, and a portrait photo if wanted.
- **Format:** quote up to 200 characters; portrait 1:1, at least 800 × 800 px. **Example shape:** `„<quote>" — <name>, <role>`.
- **Or:** confirm that there should be no quote.

### 2.7 Company name in the «За нас» text

- **Where:** `ABOUT_TEXT` in `app/about/page.tsx`, first sentence ("Нашата компанија … е вашиот доверлив партнер"). The text was sent with a blank; it prints "Јавор Шпед" for now.
- **Needed:** confirm that name, or send the one to print there.

---

## 3. City Center

### 3.1 Construction progress (before-launch B4)

- **Where:** `construction` in the `city-center` entry of `projects` in `data/index.ts`, and the status of each building in `data/generate.ts` (`status` on each building).
- **Needed per building (01–06):** the real phase (planning, foundation, structure, exterior, interior, completed) and the date it was last checked; for the project: expected handover date.
- **Format:** phase as one of the six words, dates `yyyy-mm-dd`. **Example shape:** `Building 03: exterior, checked <yyyy-mm-dd>`.
- **Today:** the project says 90 % "Конструкција во тек" while buildings 01–02 are at interior and 03–04 at exterior; nothing is dated.

### 3.2 Apartment data (before-launch B5)

- **Where:** `data/generate.ts` (generated mock data; only Building 06, floor 3 is real). Every apartment belongs to a project (`projectId`), optionally to a building, and has a floor; a new project is added to `projects` in `data/index.ts` with its apartments and then appears on Пронајди стан, in Контакт and in the comparison without any other change.
- **Needed for each apartment:** building, floor, number, area (m²), balcony area, rooms, orientation, status (available, reserved, sold). The site shows no prices.
- **Format:** a spreadsheet, one row per apartment. **Example shape:** `B02 | 4 | 407 | 62,4 | 6,0 | 2 | юг | достапен`.

### 3.3 Floor plans and photos for the other buildings

- **Where:** `lib/assets.ts` (floor plans by apartment) and `public/images/floorplans/`.
- **Format:** floor plan as PNG or JPG, at least 2000 px on the long side, white or transparent background; one image per apartment type, or one per floor. Room photos or renders in landscape, at least 1600 px wide, with a description of the room.

### 3.4 360° tours and room videos

- **Where:** `tour` on an apartment (`data/generate.ts`) and the room `video` / `poster` entries (`RoomTourRoom` and `FloorPlanExplorerData` in `types/index.ts`; the Станбена Куќа ones are in `data/index.ts`).
- **Format:** video MP4 (H.264), up to 15 seconds, 1280 × 720, under 600 KB each, no sound; a still frame (JPG, 1280 × 720) for each. Sections without a tour or room list stay hidden.

### 3.5 Map link for the project

- **Where:** `development.mapQuery` in `data/generate.ts`.
- **Format:** the street address as it should be searched, or a Google Maps link to the building site.

### 3.6 Nearby places on the location map

- **City Center:** done. The map on `/development` draws four of the places from `development.nearbyPoints` (Автопат А4, Бела Река, Стадион Младост, Спортска сала Парк) with their distances, placed from the Google Maps view the owner sent (`PLACE_SPOTS` and `CITY_CENTER_COORDINATES` in `app/development/page.tsx`). Ул. Климент Охридски and Макпетрол 051 are in the data but have no spot on the drawing yet.
- **Still needed:** the same for the sales office on Контакт and for each other project: 3 to 5 places that matter to a buyer, each with its name and either the distance or the walking time in minutes (the map takes any short line, for example `450 м` or `5 мин`). Until it exists those maps show only the grid, the pin and the address.
- **Format:** name up to 24 characters (it is set at 9px on the drawing). Where each place sits on the drawing (a position on a 400 × 300 canvas, the pin being at 200 × 140) is a design choice we make once we have the list.
- **Check:** the coordinates of City Center are the centre of the Google Maps view the owner sent, which is close to but not exactly on the site; send the exact pin if the link should land on the building.

### 3.7 Homepage: what the board asks for and the site does not have yet

- **Film «Три децении, во една минута»:** a film of about one minute, 1994 to today, all projects. `Film` in `components/home/Film.tsx` shows a still until you pass it `src` (`FILM_STILL` and the call are in `app/page.tsx`). The hero button «Гледај видео» from the board is left out until the film exists.
- **«Избрани адреси» (3 most beautiful completed projects):** there is no completed project in the data yet, so the section is not shown. Needed: which 3 completed buildings go there, with name, settlement, year and a photo each.
- **«Ново · во продажба»:** it shows the projects that are under construction (City Center, Дојрански Рај). Confirm which 1–2 projects are the new ones.
- **Numbers «Изградени на доверба»:** `FIGURES` in `app/page.tsx` holds 40 completed buildings and 8.000+ m², both marked provisional in the text document; they also disagree with the strip in the hero («5 завршени проекти»). Send the exact figures. The fourth number, the cities, has no value yet, so it is not shown.
- **Quotes from residents:** the section is hidden until 3 real statements with a name and a building arrive (never invented ones).
- **Three detail photos** (material, interior, view from the terrace) for the band the board shows between the details and «Наскоро».
- **«Наскоро» sign-up:** the board has an input for an e-mail or phone; the site has nowhere to send it, so the button leads to the form on Контакт. Decide where the waiting list should go.

### 3.8 ГТЦ Глобал: what the page still lacks

- **Where:** the `gtc-global` entry of `projects` in `data/index.ts`; it shows only what is known.
- **Needed:** the total area, number of floors, number of shops and offices, parking places, the start year of construction (one source says 2006), the holding's role (investor or contractor) and which company of the holding is named.
- **Photos:** all five come from Wikimedia Commons (2009–2015, before the fire of 2 January 2021). Send our own current photos (front from the square, the glass corner, from the boulevard); then the credit line can go (see `docs/photo-credits.md`).

### 3.9 Илинденска: what the page still lacks

- **Where:** the `ilindenska` entry of `projects` in `data/index.ts`.
- **Needed:** the street number, the year of completion, number of floors, number of apartments and shops, total area, and our own photos of the building from the street, from the corner and from the back. Until then its card shows the logo mark and its page has no photo block.

---

## 4. Дојрански Рај (before-launch B3)

- **Where:** the `dojranski-raj` entry of `projects` in `data/index.ts` and `dojranFloors` in `data/dojran.ts`.
- **Needed:** the real number of apartments (the project says 30, the floor pages list 7), and per apartment: floor, number, area, status, one floor plan, 4–10 photos or renders.
- **Format:** spreadsheet row per apartment as in 3.2; photos landscape at least 1600 px wide.
- **Until then:** the apartments listed on Пронајди стан and on the floor pages are sample data made from the floor list (`buildSampleApartments`, marked `sample` in `data/index.ts`); apartment list for Дојрански Рај is needed to replace them.

## 5. Станбена Куќа

- **Where:** the `stanbena-kukja` entry of `projects` in `data/index.ts` (name `Станбена Куќа`, address `/projects/stanbena-kukja`).
- **Needed:** the final project name, expected completion, current phase, and the 7-apartment list as in 3.2 (apartment list for Станбена Куќа). Until then the seven apartments come from the floors, areas and types on its page, with sample statuses, marked `sample` in `data/index.ts`.
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

- **Closed by the redesign.** The maps are now a drawing of the site's own, with no tile provider and no key (`components/location-map/LocationMap.tsx`). Nothing is needed here any more; the Leaflet package is still in `package.json` and can be removed in a separate change.

### 6.4 Public address

- **Where:** the environment variable `NEXT_PUBLIC_SITE_URL` in Vercel (canonical links, sitemap, share images).
- **Needed:** the domain the site will live on, e.g. `https://<domain>`.
