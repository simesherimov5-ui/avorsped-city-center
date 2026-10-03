import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRIVACY_PUBLISHED, privacyPolicy } from "@/components/privacy/privacy-content";

export const metadata: Metadata = {
  title: "Политика за приватност",
  description: "Како Јавор Шпед ги собира, користи и чува вашите податоци.",
  alternates: { canonical: "/privacy" },
};

/**
 * The privacy policy page. Its structure is ready; it stays hidden (404) until the text exists and
 * PRIVACY_PUBLISHED is switched on in components/privacy/privacy-content.ts.
 */
export default function PrivacyPage() {
  if (!PRIVACY_PUBLISHED) notFound();
  const { updated, controller, sections } = privacyPolicy;

  return (
    <div className="pt-24 sm:pt-28">
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:px-10">
        <h1 className="font-display text-4xl sm:text-5xl">Политика за приватност</h1>
        {updated && <p className="mt-3 text-sm text-ink/70">Последна измена: {updated}</p>}

        {controller.name && (
          <section className="mt-10">
            <h2 className="font-display text-2xl">Одговорен за податоците</h2>
            <p className="mt-3 leading-relaxed text-ink/80">
              {controller.name}
              {controller.address && <>, {controller.address}</>}
              {controller.email && (
                <>
                  {" "}
                  <a className="underline underline-offset-4" href={`mailto:${controller.email}`}>
                    {controller.email}
                  </a>
                </>
              )}
            </p>
          </section>
        )}

        {sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="font-display text-2xl">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="mt-3 leading-relaxed text-ink/80">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
