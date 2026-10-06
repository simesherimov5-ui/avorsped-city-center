export type BookingRequest = {
  interest: string;
  /** Only for an apartment: "1", "2", "3" or "4+". */
  rooms?: string;
  /** ISO date and the readable label the visitor saw ("Пон 05 окт"). */
  date: string;
  dateLabel: string;
  time: string;
  name: string;
  phone: string;
  /** What the visitor came from, if anything, e.g. "Стан 203 · Зграда 03 · City Center". */
  reference?: { label: string; project?: string; building?: string; apartment?: string };
};

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
