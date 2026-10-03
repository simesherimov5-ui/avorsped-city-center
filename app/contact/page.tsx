import type { Metadata } from "next";
import { companyInfo, getApartment, getBuilding, projects } from "@/data";
import { ContactForm, type Interest } from "@/components/contact/ContactForm";
import { ContactStage } from "@/components/contact/ContactStage";
import { DirectPanel } from "@/components/contact/DirectPanel";
import "@/components/black/black.css";
import "@/components/contact/contact.css";

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
  const building = getBuilding(apartment?.buildingId ?? first(params.building) ?? "");
  // The project comes from the data: whichever project owns the apartment's or building's building. Only a bare
  // project link (no apartment or building) names a project directly, so a reference can never carry a wrong name.
  const project =
    (building && projects.find((p) => p.buildings?.some((b) => b.id === building.id))) ||
    projects.find((p) => p.id === first(params.project));
  const asked = first(params.interest) as Interest | undefined;
  const label = [apartment && `Стан ${apartment.number}`, building?.name, project?.name].filter(Boolean).join(" · ");
  const hasReference = Boolean(label);
  const initialInterest: Interest | undefined =
    asked && INTERESTS.includes(asked) ? asked : hasReference ? "apartment" : undefined;
  const initialRooms =
    apartment && apartment.bedrooms >= 1 ? (apartment.bedrooms >= 4 ? "4+" : String(apartment.bedrooms)) : undefined;
  const reference = hasReference
    ? { label, project: project?.id, building: building?.id, apartment: apartment?.id }
    : undefined;

  return (
    <div data-theme="black" className="bk-page">
      <ContactStage>
        <header className="ct-head bk-wrap">
          <div data-seq="eyebrow" className="bk-eyebrow ct-pre">
            Контакт
          </div>
          <h1 data-seq="h1" className="ct-h1 bk-serif ct-pre">
            Закажете <em>приватна</em> консултација.
          </h1>
          <p data-seq="lead" className="ct-lead ct-pre">
            Четири кратки чекори. Ние ќе ви се јавиме за потврда на терминот.
          </p>
        </header>

        <div className="ct-cols bk-wrap">
          <ContactForm
            initialInterest={initialInterest}
            initialRooms={initialRooms}
            reference={reference}
            phone={companyInfo.phone}
          />
          <DirectPanel
            phone={companyInfo.phone}
            email={companyInfo.email}
            hours={companyInfo.hours}
            address={companyInfo.address}
            messengerNumber={companyInfo.messengerNumber}
            coordinates={companyInfo.coordinates}
          />
        </div>
      </ContactStage>
    </div>
  );
}
