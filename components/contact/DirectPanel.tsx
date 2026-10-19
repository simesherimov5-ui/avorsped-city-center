import { CONTACT_MAP_QUERY, mapEmbedUrl, mapSearchUrl } from "@/lib/locations";

type Props = {
  phone: string;
  email: string;
  hours: string;
  address: string;
  /** Viber / WhatsApp number in international form, e.g. "+389 70 123 456". Empty hides the row. */
  messengerNumber?: string;
};

/** The right-hand panel: the direct channels, the working hours, and a Google map of the office. */
export function DirectPanel({ phone, email, hours, address, messengerNumber }: Props) {
  const digits = messengerNumber?.replace(/\D/g, "") ?? "";

  return (
    <aside data-seq="panel" className="ct-side ct-pre" aria-label="Директен контакт">
      <div className="bk-eyebrow">Директно</div>
      <div className="ct-rows">
        <div className="ct-row">
          <span className="bk-label">Телефон</span>
          <a href={`tel:${phone.replace(/ /g, "")}`} className="ct-val">
            {phone}
          </a>
        </div>
        {digits && (
          <div className="ct-row">
            <span className="bk-label">Viber / WhatsApp</span>
            <span className="ct-val">
              <a href={`viber://chat?number=%2B${digits}`} className="ct-val">
                Viber
              </a>{" "}
              /{" "}
              <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className="ct-val">
                WhatsApp
              </a>
            </span>
          </div>
        )}
        <div className="ct-row">
          <span className="bk-label">Е-пошта</span>
          <a href={`mailto:${email}`} className="ct-val">
            {email}
          </a>
        </div>
        <div className="ct-row">
          <span className="bk-label">Работно време</span>
          {/* One line per range ("Пон–Пет 09:00–18:00"): the days on the left, the times on the right. */}
          <ul className="ct-hours">
            {hours.split(", ").map((range) => {
              const split = range.lastIndexOf(" ");
              return (
                <li key={range}>
                  <span>{range.slice(0, split)}</span>
                  <span className="bk-mono">{range.slice(split + 1)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* The real Google map (no API key), in the site's 1px frame, with Google's own colours and pin. */}
      <div className="ct-map">
        <iframe
          src={mapEmbedUrl(CONTACT_MAP_QUERY)}
          title="Локација – ГТЦ Глобал, Струмица"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="ct-addr">
        <span>{address}</span>
        <a href={mapSearchUrl(CONTACT_MAP_QUERY)} target="_blank" rel="noopener">
          Отвори во Google Maps
        </a>
      </div>
    </aside>
  );
}
