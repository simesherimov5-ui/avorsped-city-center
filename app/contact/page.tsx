import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { companyInfo, development } from "@/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BookingForm } from "@/components/BookingForm";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Контакт",
  description: "Контактирајте нè: Јавор Шпед. Адреса, телефон, е-пошта и контакт формулар.",
};

export default function ContactPage() {
  return (
    <div className="pt-24 sm:pt-28">
      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 lg:px-10">
        <SectionHeading eyebrow="Стапете во контакт" title="Контактирајте нè" />

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div>
            <ul className="space-y-5 text-base sm:text-sm">
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-gold-deep" />
                <span>{companyInfo.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gold-deep" />
                <a
                  href={`tel:${companyInfo.phone.replace(/ /g, "")}`}
                  className="focus-ring -my-3 flex min-h-11 items-center"
                >
                  {companyInfo.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold-deep" />
                <a href={`mailto:${companyInfo.email}`} className="focus-ring -my-3 flex min-h-11 items-center">
                  {companyInfo.email}
                </a>
              </li>
              <li className="flex gap-3">
                <Clock className="h-4 w-4 shrink-0 text-gold-deep" />
                <span>{companyInfo.hours}</span>
              </li>
            </ul>

            <div className="mt-8 aspect-[4/3] border border-line">
              <iframe
                title="Мапа со локација на канцеларијата"
                className="h-full w-full grayscale"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(development.mapQuery)}&output=embed`}
              />
            </div>

            <div className="mt-8">
              <Button href="/consultation" variant="primary">
                Закажи консултација
              </Button>
            </div>
          </div>

          <div>
            <BookingForm kind="info-request" compact />
          </div>
        </div>
      </section>
    </div>
  );
}
