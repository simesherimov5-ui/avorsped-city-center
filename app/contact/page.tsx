import type { Metadata } from "next";
import { companyInfo, development, getApartment, getBuilding, projects } from "@/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GuidedBooking, type Interest } from "@/components/contact/GuidedBooking";
import { DirectPanel } from "@/components/contact/DirectPanel";

export const metadata: Metadata = {
  title: "Контакт",
  description: "Контактирајте нè: Јавор Шпед. Закажете консултација, адреса, телефон и е-пошта.",
};

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const INTERESTS: Interest[] = ["apartment", "commercial", "parking"];

export default async function ContactPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;

  // Arriving from an apartment or project page: pre-select the interest and carry the reference along.
  const apartment = getApartment(first(params.apartment) ?? "");
  const building = getBuilding(first(params.building) ?? apartment?.buildingId ?? "");
  const project = projects.find((p) => p.id === first(params.project));
  const asked = first(params.interest) as Interest | undefined;
  const initialInterest: Interest = asked && INTERESTS.includes(asked) ? asked : "apartment";
  const reference =
    [apartment && `Стан ${apartment.number}`, building?.name, project?.name].filter(Boolean).join(" · ") || undefined;
  const initialRooms =
    apartment && apartment.bedrooms >= 1 ? (apartment.bedrooms >= 4 ? "4+" : String(apartment.bedrooms)) : undefined;

  return (
    <div className="pt-24 sm:pt-28">
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
        <SectionHeading eyebrow="Стапете во контакт" title="Контактирајте нè" />

        <div className="mt-12 grid gap-12 lg:grid-cols-[6fr_5fr] lg:gap-16">
          <GuidedBooking initialInterest={initialInterest} initialRooms={initialRooms} reference={reference} />
          <DirectPanel
            phone={companyInfo.phone}
            email={companyInfo.email}
            hours={companyInfo.hours}
            address={companyInfo.address}
            messengerNumber={companyInfo.messengerNumber}
            mapQuery={development.mapQuery}
          />
        </div>
      </section>
    </div>
  );
}
