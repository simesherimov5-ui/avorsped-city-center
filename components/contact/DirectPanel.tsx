import { LazyMap } from "./LazyMap";

type Props = {
  phone: string;
  email: string;
  hours: string;
  address: string;
  /** Viber / WhatsApp number in international form, e.g. "+389 70 123 456". Empty hides the row. */
  messengerNumber?: string;
  coordinates: { lat: number; lng: number };
};

/** The right-hand panel: the direct channels, the working hours, and a dark map of the office. */
export function DirectPanel({ phone, email, hours, address, messengerNumber, coordinates }: Props) {
  const digits = messengerNumber?.replace(/\D/g, "") ?? "";
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;

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
          {/* one range per line, so "09:00–18:00" never breaks in the middle */}
          <span className="ct-val ct-val-lines">
            {hours.split(", ").map((range) => (
              <span key={range}>{range}</span>
            ))}
          </span>
        </div>
      </div>

      <LazyMap lat={coordinates.lat} lng={coordinates.lng} />
      <div className="ct-addr">
        <span>{address}</span>
        <a href={mapsHref} target="_blank" rel="noopener noreferrer">
          Отвори во Google Maps
        </a>
      </div>
    </aside>
  );
}
