import type { Metadata } from "next";
import { companyInfo, getApartment, getProject, projectsOnSale } from "@/data";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactStage } from "@/components/contact/ContactStage";
import { DirectPanel } from "@/components/contact/DirectPanel";
import "@/components/black/black.css";
import "@/components/contact/contact.css";
// the cream colour preview (/contact?preview=cream): rules scoped to data-tone="cream", inert on the normal page
import "@/components/contact/contact-cream.css";
import { pageMetadata } from "@/lib/seo";
import { startProjectId } from "@/lib/contact-start";

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// /contact?preview=cream is a colour preview of this same page: it is not for search engines
const isCreamPreview = (params: Params) => first(params.preview) === "cream";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Params> }): Promise<Metadata> {
  return pageMetadata({
    title: "Контакт и консултација",
    description:
      "Закажете консултација за стан или пишете ни: адреса, телефон и е-пошта на Javor Sped Holding во Струмица.",
    path: "/contact",
    noindex: isCreamPreview(await searchParams),
  });
}

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
    getProject(
      startProjectId(
        first(params.project),
        options.map((o) => o.id)
      ) ?? ""
    ) ||
    onSale.find((p) => p.project.buildings?.some((b) => b.id === buildingParam))?.project;
  const start = { projectId: project?.id };

  return (
    <div data-theme="black" data-tone={isCreamPreview(params) ? "cream" : undefined} className="bk-page">
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
