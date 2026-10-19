import { projectsOnSale } from "@/data";
import { todayIso } from "@/components/contact/booking-config";
import { validateBooking } from "@/components/contact/booking-validate";
import { bookingEmail } from "@/components/contact/send-booking";

/**
 * The booking form's server side: checks the request again (the browser's checks are only a convenience) and e-mails it to
 * the sales team through Resend's REST API (no SDK). The e-mail starts with the area range the visitor asked for.
 *
 * Settings (environment variables, never in the repository):
 *   RESEND_API_KEY       the Resend API key
 *   BOOKING_TO_EMAIL     who receives the bookings; several addresses separated by commas
 *   BOOKING_FROM_EMAIL   the sender, e.g. "Јавор Шпед <booking@your-domain.mk>" (a domain verified in Resend)
 *
 * Without them, `next dev` prints the e-mail in the server log and answers "ok", so the form can be tried locally;
 * a production build answers 503, so the form tells the visitor to phone instead of pretending it was sent.
 */
const MAX_BODY_BYTES = 8 * 1024;

const reply = (status: number, body: Record<string, unknown>) => Response.json(body, { status });

export async function POST(request: Request) {
  // Only this site's own pages may post here.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return reply(403, { error: "Forbidden." });
  if (!request.headers.get("content-type")?.includes("application/json")) return reply(415, { error: "JSON only." });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return reply(413, { error: "Too large." });
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return reply(400, { error: "Not JSON." });
  }

  const checked = validateBooking(input, {
    projects: projectsOnSale().map(({ project }) => ({ id: project.id, name: project.name })),
    today: todayIso(),
  });
  if (!checked.ok) return reply(400, { error: checked.error });

  const { subject, text } = bookingEmail(checked.value);
  const key = process.env.RESEND_API_KEY;
  const to = (process.env.BOOKING_TO_EMAIL ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
  const from = process.env.BOOKING_FROM_EMAIL;

  if (!key || to.length === 0 || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `\n[booking] not sent (no RESEND_API_KEY / BOOKING_TO_EMAIL / BOOKING_FROM_EMAIL). The e-mail would be:\nSubject: ${subject}\n\n${text}\n`
      );
      return reply(200, { ok: true, delivered: false });
    }
    console.error("[booking] the e-mail settings are missing, so a booking could not be sent.");
    return reply(503, { error: "Booking e-mail is not set up." });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  }).catch(() => null);
  if (!response?.ok) {
    console.error(`[booking] Resend answered ${response?.status ?? "nothing"}.`);
    return reply(502, { error: "The e-mail could not be sent." });
  }
  return reply(200, { ok: true, delivered: true });
}
