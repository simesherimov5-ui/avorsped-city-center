import { AREA_UNKNOWN_TEXT, areaText } from "./booking-config";

export type BookingRequest = {
  /** The project the visitor is asking about: its name and id in the data. Null when they are undecided. */
  project: string | null;
  projectId: string | null;
  /** True for «Сè уште не знам» on the project question: the team prepares an overview of all projects. */
  undecided: boolean;
  /** The area range the visitor wants, in m² (the top end 150 means "150+"); null when they do not know yet. */
  areaMin: number | null;
  areaMax: number | null;
  /** True for «Сè уште не знам» on the area question: the team advises at the meeting. */
  areaUnknown: boolean;
  /** ISO date and the readable label the visitor saw ("Пон 05 окт"). */
  date: string;
  dateLabel: string;
  time: string;
  name: string;
  phone: string;
};

/** The area line of a request: "65–85 m²", or «Не знае – совет». */
export const areaOf = (request: Pick<BookingRequest, "areaMin" | "areaMax" | "areaUnknown">): string =>
  request.areaUnknown || request.areaMin === null || request.areaMax === null
    ? AREA_UNKNOWN_TEXT
    : areaText(request.areaMin, request.areaMax);

/**
 * The request as plain lines, for the e-mail the company receives. The area comes first: it is what sales has to
 * prepare before the meeting. An undecided visitor reads «Проект: не е избран», so the team knows to prepare an
 * overview of all projects.
 */
export function bookingLines(request: BookingRequest): string[] {
  return [
    `Површина: ${areaOf(request)}`,
    request.project ? `Проект: ${request.project}` : "Проект: не е избран",
    `Термин: ${request.dateLabel}, ${request.time}`,
    `Име: ${request.name}`,
    `Телефон: ${request.phone}`,
  ];
}

/** The e-mail's subject and body. The subject carries the area and the project, never the visitor's own words. */
export function bookingEmail(request: BookingRequest): { subject: string; text: string } {
  return {
    subject: `Нова консултација · ${areaOf(request)} · ${request.project ?? "проект не е избран"}`,
    text: bookingLines(request).join("\n"),
  };
}

/**
 * Hands the request to the sales team: the server (app/api/booking/route.ts) checks it again and sends the e-mail.
 * It throws on any failure; the form already keeps the visitor's answers and shows the phone number when it does.
 */
export async function sendBooking(request: BookingRequest): Promise<void> {
  const response = await fetch("/api/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(`The booking was not sent (${response.status}).`);
}
