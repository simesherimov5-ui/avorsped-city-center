export type BookingRequest = {
  /** The project the visitor is looking at: its name and id in the data. Null when they are undecided. */
  project: string | null;
  projectId: string | null;
  /** True for «Сè уште не знам»: the team prepares an overview of all projects. */
  undecided: boolean;
  /** What an undecided visitor is looking for (Двособен, Трособен…); empty if they skipped it or chose a project. */
  preferences: string[];
  /** Only when the project has buildings (City Center). */
  building?: string;
  buildingId?: string;
  /** A specific apartment, if the visitor has one in mind: its label ("Стан 21 · Кат 3") and, if picked from the list, its id. */
  unit?: string;
  unitId?: string;
  /** ISO date and the readable label the visitor saw ("Пон 05 окт"). */
  date: string;
  dateLabel: string;
  time: string;
  name: string;
  phone: string;
};

/**
 * The request as plain lines, for the confirmation and for the e-mail the company receives. An undecided visitor reads
 * «Проект: не е избран» and what they are looking for, so the team knows to prepare an overview of all projects.
 */
export function bookingLines(request: BookingRequest): string[] {
  return [
    request.project ? `Проект: ${request.project}` : "Проект: не е избран",
    request.undecided
      ? `Што бара: ${request.preferences.length ? request.preferences.join(", ") : "не е наведено"}`
      : "",
    request.building ? `Зграда: ${request.building}` : "",
    request.unit ? `Стан: ${request.unit}` : "",
    `Термин: ${request.dateLabel}, ${request.time}`,
    `Име: ${request.name}`,
    `Телефон: ${request.phone}`,
  ].filter(Boolean);
}

/**
 * Hands the request to the sales team.
 *
 * TODO(client): there is no backend yet, so nothing is delivered — this only waits as a real send would. Decide
 * where bookings go (an e-mail address, a mail service or a CRM), then replace the body with that call and let
 * it throw on failure: the form already keeps the visitor's answers and shows the phone number when it does.
 */
export async function sendBooking(request: BookingRequest): Promise<void> {
  void request;
  await new Promise((resolve) => setTimeout(resolve, 800));
}
