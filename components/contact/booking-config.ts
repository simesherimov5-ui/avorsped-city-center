// The booking form's days and times, computed from one config. Nothing here is hard-coded to a date.

export const BOOKING_TIME_ZONE = "Europe/Skopje";

/** The time slots offered for every day: start and end inclusive, one slot every `stepMinutes`. */
export const TIME_SLOTS = { start: "09:00", end: "16:00", stepMinutes: 30 };

/** Dates (ISO, "2026-12-25") the office is closed, on top of weekends — public holidays. TODO(client): fill in. */
export const CLOSED_DATES: string[] = [];

/** How many working days are offered. */
export const DAYS_SHOWN = 5;

const WEEKDAYS = ["Нед", "Пон", "Вто", "Сре", "Чет", "Пет", "Саб"];
const MONTHS = ["јан", "фев", "мар", "апр", "мај", "јун", "јул", "авг", "сеп", "окт", "ное", "дек"];

export type BookingDay = {
  /** ISO date, "2026-10-05". */
  iso: string;
  weekday: string;
  /** Two digits, "05". */
  day: string;
  month: string;
  /** What the summary and the request carry: "Пон 05 окт". */
  label: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** "09:00", "09:30", … "16:00" — both ends included. */
export function buildSlots(config = TIME_SLOTS): string[] {
  const out: string[] = [];
  for (let m = toMinutes(config.start); m <= toMinutes(config.end); m += config.stepMinutes) {
    out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return out;
}

/** Today's date in the booking time zone as "YYYY-MM-DD", whatever time zone the visitor's device is set to. */
export function todayIso(now = new Date(), timeZone = BOOKING_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * The next `count` working days after `today`: starting from tomorrow, Monday to Friday only, skipping any
 * date in `closed`. Opened on a Friday or at the weekend, the first day is Monday.
 */
export function nextWorkingDays(today: string, closed: string[] = CLOSED_DATES, count = DAYS_SHOWN): BookingDay[] {
  if (!today) return [];
  const [y, m, d] = today.split("-").map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d));
  const out: BookingDay[] = [];
  while (out.length < count) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const dow = cursor.getUTCDay();
    const iso = `${cursor.getUTCFullYear()}-${pad(cursor.getUTCMonth() + 1)}-${pad(cursor.getUTCDate())}`;
    if (dow === 0 || dow === 6 || closed.includes(iso)) continue;
    const day = pad(cursor.getUTCDate());
    const month = MONTHS[cursor.getUTCMonth()];
    out.push({ iso, weekday: WEEKDAYS[dow], day, month, label: `${WEEKDAYS[dow]} ${day} ${month}` });
  }
  return out;
}
