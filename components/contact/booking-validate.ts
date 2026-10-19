import { AREA, buildSlots, dayLabelOf, isWorkingDay } from "./booking-config";
import type { BookingRequest } from "./send-booking";

/** The most digits a phone number can have. */
export const PHONE_MAX_DIGITS = 15;
/** The fewest digits that make a usable phone number. */
export const PHONE_MIN_DIGITS = 8;

export const digitsOf = (value: string) => value.replace(/\D/g, "");

/**
 * What a phone field may hold, as the visitor types or pastes: digits, spaces for readability (never two in a row or
 * at the start) and one "+" at the very start. Everything else is dropped, so letters can never appear; at most
 * 15 digits.
 */
export function sanitizePhone(raw: string): string {
  let out = "";
  let digits = 0;
  for (const ch of raw) {
    if (ch >= "0" && ch <= "9") {
      if (digits < PHONE_MAX_DIGITS) {
        out += ch;
        digits++;
      }
    } else if (ch === "+" && out === "") {
      out = "+";
    } else if (ch === " " && out !== "" && !out.endsWith(" ")) {
      out += " ";
    }
  }
  return out;
}

export const isValidName = (value: string) => value.trim().length >= 2;
export const isValidPhone = (value: string) => {
  const n = digitsOf(value).length;
  return n >= PHONE_MIN_DIGITS && n <= PHONE_MAX_DIGITS && /^\+?[\d ]+$/.test(value.trim());
};

/** An e-mail address in a usable shape (something@something.tld, no spaces). Only checked when one is given. */
export const isValidEmail = (value: string) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

export type ValidationResult = { ok: true; value: BookingRequest } | { ok: false; error: string };

const isInt = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);

/**
 * Checks a booking the server received and returns a clean copy: names and labels come from the data and the config,
 * not from the browser. `projects` are the projects the form offers; `today` is "YYYY-MM-DD" in the booking time zone.
 */
export function validateBooking(
  input: unknown,
  ctx: { projects: { id: string; name: string }[]; today: string }
): ValidationResult {
  if (typeof input !== "object" || input === null) return { ok: false, error: "The request is not an object." };
  const r = input as Record<string, unknown>;

  let project: string | null = null;
  let projectId: string | null = null;
  const undecided = r.undecided === true;
  if (!undecided) {
    const found = ctx.projects.find((p) => p.id === r.projectId);
    if (!found) return { ok: false, error: "Unknown project." };
    project = found.name;
    projectId = found.id;
  }

  let areaMin: number | null = null;
  let areaMax: number | null = null;
  const areaUnknown = r.areaUnknown === true;
  if (!areaUnknown) {
    if (!isInt(r.areaMin) || !isInt(r.areaMax)) return { ok: false, error: "The area must be two whole numbers." };
    if (r.areaMin < AREA.min) return { ok: false, error: `The area starts at ${AREA.min} m² at the least.` };
    if (r.areaMax > AREA.max) return { ok: false, error: `The area ends at ${AREA.max} m² at the most.` };
    if (r.areaMin >= r.areaMax) return { ok: false, error: "The area range must run from less to more." };
    areaMin = r.areaMin;
    areaMax = r.areaMax;
  }

  if (typeof r.date !== "string" || !isWorkingDay(r.date) || r.date <= ctx.today)
    return { ok: false, error: "The day must be a working day after today." };
  if (typeof r.time !== "string" || !buildSlots().includes(r.time)) return { ok: false, error: "Unknown time." };

  if (typeof r.name !== "string") return { ok: false, error: "The name is missing." };
  const name = r.name.replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 100) return { ok: false, error: "The name must be 2 to 100 characters." };

  if (typeof r.phone !== "string" || r.phone.length > 40) return { ok: false, error: "The phone is missing." };
  const phone = r.phone.trim();
  if (!isValidPhone(phone)) return { ok: false, error: "The phone must be 8 to 15 digits." };

  // The e-mail is optional: empty or missing is fine, a given one must be an address.
  let email: string | undefined;
  if (r.email !== undefined && r.email !== null && r.email !== "") {
    if (typeof r.email !== "string" || !isValidEmail(r.email.trim()))
      return { ok: false, error: "The e-mail is not valid." };
    email = r.email.trim();
  }

  return {
    ok: true,
    value: {
      project,
      projectId,
      undecided,
      areaMin,
      areaMax,
      areaUnknown,
      date: r.date,
      dateLabel: dayLabelOf(r.date),
      time: r.time,
      name,
      phone,
      ...(email ? { email } : {}),
    },
  };
}
