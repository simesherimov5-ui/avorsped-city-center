import type { Metadata } from "next";
import { companyInfo, getApartment, getProject, projectsOnSale } from "@/data";
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

  // Arriving from a project, building or apartment page: only the project is carried over (the form asks for an area
  // range, not for a building or an apartment). It comes from the data, so a reference can never carry a wrong name.
  const apartment = getApartment(first(params.apartment) ?? "");
  const onSale = projectsOnSale();
  const options = onSale.map(({ project }) => ({ id: project.id, name: project.name }));
  const buildingParam = first(params.building) ?? "";
  const project =
    (apartment && getProject(apartment.projectId)) ||
    getProject(LEGACY_PROJECTS[first(params.project) ?? ""] ?? first(params.project) ?? "") ||
    onSale.find((p) => p.project.buildings?.some((b) => b.id === buildingParam))?.project;
  const start = { projectId: project?.id };

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
          <ContactForm projects={options} start={start} phone={companyInfo.phone} />
          <DirectPanel
            phone={companyInfo.phone}
            email={companyInfo.email}
            hours={companyInfo.hours}
            address={companyInfo.address}
            messengerNumber={companyInfo.messengerNumber}
          />
        </div>
      </ContactStage>
    </div>
  );
}
