import type { Metadata } from "next";
import { companyInfo, floorLabelOf, getApartment, getProject, projectsOnSale } from "@/data";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactStage } from "@/components/contact/ContactStage";
import { DirectPanel } from "@/components/contact/DirectPanel";
import "@/components/black/black.css";
import "@/components/contact/contact.css";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Контакт и консултација",
  description:
    "Закажете консултација за стан или пишете ни: адреса, телефон и е-пошта на Javor Sped Holding во Струмица.",
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
  // The form asks about the projects that are on sale (from the data, whatever they are); the apartments it can offer
  // are the available ones, plus the one the visitor came from.
  const onSale = projectsOnSale();
  const options = onSale.map(({ project }) => ({
    id: project.id,
    name: project.name,
    // the building step appears for a project that has buildings
    buildings: (project.buildings ?? []).map((b) => ({ id: b.id, name: b.name })),
  }));
  const units = onSale
    .flatMap((p) => p.apartments)
    .filter((a) => a.status === "available" || a.id === apartment?.id)
    .map((a) => ({
      id: a.id,
      projectId: a.projectId,
      buildingId: a.buildingId,
      floor: a.floor,
      floorLabel: floorLabelOf(a),
      number: a.number,
      area: a.area,
      areaDecimals: a.areaDecimals,
    }));
  // The project comes from the data: the apartment's own, else the one named in the address, else the one that owns
  // the named building, so a reference can never carry a wrong name.
  const buildingParam = first(params.building) ?? "";
  const project =
    (apartment && getProject(apartment.projectId)) ||
    getProject(LEGACY_PROJECTS[first(params.project) ?? ""] ?? first(params.project) ?? "") ||
    onSale.find((p) => p.project.buildings?.some((b) => b.id === buildingParam))?.project;
  const buildingId = apartment?.buildingId ?? (buildingParam || undefined);
  const building = project?.buildings?.find((b) => b.id === buildingId);
  const start = { projectId: project?.id, buildingId: building?.id, unitId: apartment?.id };

  return (
    <div data-theme="black" className="bk-page grain grain--dark">
      <ContactStage>
        <header className="ct-head bk-wrap">
          <div data-seq="eyebrow" className="bk-eyebrow ct-pre">
            Контакт
          </div>
          <h1 data-seq="h1" className="ct-h1 bk-serif ct-pre">
            Закажете приватна консултација.
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
