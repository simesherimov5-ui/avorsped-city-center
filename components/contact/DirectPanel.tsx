type Props = {
  phone: string;
  email: string;
  hours: string;
  address: string;
  /** Viber / WhatsApp number in international form, e.g. "+389 70 123 456". Empty hides the row. */
  messengerNumber?: string;
  mapQuery: string;
};

const row = "flex min-h-14 items-center justify-between gap-4 border-b border-paper/15 py-3 text-[15px]";
const value = "mono-stat text-right text-[13px] text-gold";
const link = "focus-ring -my-1 flex min-h-11 items-center justify-end text-right hover:text-gold-light";

/** Ink panel with the direct channels and a dark-styled map of the location. */
export function DirectPanel({ phone, email, hours, address, messengerNumber, mapQuery }: Props) {
  const tel = phone.replace(/ /g, "");
  const digits = messengerNumber?.replace(/\D/g, "") ?? "";

  return (
    <aside className="bg-ink p-6 text-paper sm:p-8">
      <div className="eyebrow text-gold">Директно</div>
      <div className="mt-3">
        <div className={row}>
          <span>Телефон</span>
          <a href={`tel:${tel}`} className={`${value} ${link}`} style={{ letterSpacing: 0 }}>
            {phone}
          </a>
        </div>
        {digits && (
          <div className={row}>
            <span>Viber / WhatsApp</span>
            <span className="flex items-center gap-2">
              <a href={`viber://chat?number=%2B${digits}`} className={`${value} ${link}`} style={{ letterSpacing: 0 }}>
                Viber
              </a>
              <span aria-hidden className="text-paper/30">
                /
              </span>
              <a
                href={`https://wa.me/${digits}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${value} ${link}`}
                style={{ letterSpacing: 0 }}
              >
                WhatsApp
              </a>
            </span>
          </div>
        )}
        <div className={row}>
          <span>Е-пошта</span>
          <a href={`mailto:${email}`} className={`${value} ${link}`} style={{ letterSpacing: 0 }}>
            {email}
          </a>
        </div>
        <div className={row}>
          <span>Работно време</span>
          <span className={value} style={{ letterSpacing: 0 }}>
            {/* one range per line, so "10:00–14:00" never breaks in the middle */}
            {hours.split(", ").map((range) => (
              <span key={range} className="block whitespace-nowrap">
                {range}
              </span>
            ))}
          </span>
        </div>
        <div className={row}>
          <span>Адреса</span>
          <span className={value} style={{ letterSpacing: 0 }}>
            {address}
          </span>
        </div>
      </div>

      {/* Dark map: Google's embed, darkened with a filter; a gold pin sits over the marker at the centre. */}
      <div className="relative mt-6 aspect-[4/3] overflow-hidden border border-gold/40">
        <iframe
          title="Мапа со локација"
          loading="lazy"
          src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
          className="h-full w-full"
          style={{ filter: "grayscale(1) invert(1) contrast(0.85) brightness(0.8) sepia(0.35)" }}
        />
        <svg
          aria-hidden
          viewBox="0 0 24 34"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[38px] w-[27px] -translate-x-1/2 -translate-y-full"
        >
          <path
            d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 34 12 34s12-13.6 12-22.3C24 5.2 18.6 0 12 0z"
            fill="var(--color-gold)"
            stroke="var(--color-ink)"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="11.5" r="4.2" fill="var(--color-ink)" />
        </svg>
      </div>
    </aside>
  );
}
