import { Reveal } from "@/components/ui/Reveal";
import { GoogleMapPin } from "@/components/location-map/GoogleMapPin";

/**
 * «ЛОКАЦИЈА» of a photo-led project page, on the cream page: the heading (its end in Бронза) and the way to Google Maps
 * on the left; on the right the site's Google map with its pin, in a frame (at least 480px tall; 4:3 on a phone, under
 * the text). Google's embed lets a page scroll past it with one finger.
 */
export function ProjectPlace({
  name,
  city,
  place,
}: {
  name: string;
  city: string;
  place: { lat: number; lng: number };
}) {
  return (
    <section aria-label="Локација" className="on-light grain">
      <div className="mx-auto grid max-w-[1320px] items-stretch gap-14 px-[5%] pb-[72px] pt-[88px] md:pb-[120px] md:pt-[140px] lg:grid-cols-[5fr_7fr]">
        <Reveal>
          <div className="eyebrow tracking-[0.32em] text-gold-deep">ЛОКАЦИЈА</div>
          <h2 className="m-0 mt-4 font-display text-[clamp(40px,4.8vw,72px)] font-normal leading-[1.05] text-ink">
            {city}, <span className="text-gold-deep">Северна Македонија.</span>
          </h2>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-6 inline-flex min-h-11 items-center text-sm text-gold-deep underline decoration-gold decoration-2 underline-offset-4"
          >
            Отворете во Google Maps
          </a>
        </Reveal>
        <div className="flex min-w-0 flex-col">
          <GoogleMapPin
            lat={place.lat}
            lng={place.lng}
            label={`Мапа: ${name}`}
            className="!border-limestone !bg-sand lg:aspect-auto lg:min-h-[480px] lg:flex-1"
          />
        </div>
      </div>
    </section>
  );
}
