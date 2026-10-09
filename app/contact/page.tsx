import type { Metadata } from "next";
import { apartments, companyInfo, getApartment, getBuilding, projects } from "@/data";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactStage } from "@/components/contact/ContactStage";
import { DirectPanel } from "@/components/contact/DirectPanel";
import "@/components/black/black.css";
import "@/components/contact/contact.css";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Контакт и консултација",
  description:
    "Закажете консултација за стан во City Center или пишете ни: адреса, телефон и е-пошта на Јавор Шпед во Струмица.",
  path: "/contact",
});

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Old `?project=` values from before a project was renamed: they still pre-select it. */
const LEGACY_PROJECTS: Record<string, string> = { "vista-heights": "stanbena-kukja" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;

  // Arriving from an apartment or project page: pre-select the interest and carry the reference along.
  const apartment = getApartment(first(params.apartment) ?? "");
  const building = getBuilding(apartment?.buildingId ?? first(params.building) ?? "");
  // The project comes from the data: whichever project owns the apartment's or building's building. Only a bare
  // project link (no apartment or building) names a project directly, so a reference can never carry a wrong name.
  const project =
    (building && projects.find((p) => p.buildings?.some((b) => b.id === building.id))) ||
    projects.find((p) => p.id === (LEGACY_PROJECTS[first(params.project) ?? ""] ?? first(params.project)));
  // The form asks about the projects that are being built or coming; the apartments it can offer are the available
  // ones, plus the one the visitor came from.
  const options = projects
    .filter((p) => p.status !== "completed")
    .map((p) => ({ id: p.id, name: p.name, buildings: (p.buildings ?? []).map((b) => ({ id: b.id, name: b.name })) }));
  const units = apartments
    .filter((a) => a.status === "available" || a.id === apartment?.id)
    .map((a) => ({ id: a.id, buildingId: a.buildingId, floor: a.floor, number: a.number, area: a.area }));
  const start = { projectId: project?.id, buildingId: building?.id, unitId: apartment?.id };

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
        </header>

        <div className="ct-cols bk-wrap">
          <ContactForm projects={options} units={units} start={start} phone={companyInfo.phone} />
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
