import { Button } from "@/components/ui/Button";

/**
 * The invitation that closes a project page: "Дојдете да го видите", on Оникс, with the filling button to the form for
 * this project.
 */
export function ProjectCta({ projectId }: { projectId: string }) {
  return (
    <section className="bg-chrome text-on-chrome">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <h2 className="font-display text-[clamp(26px,2.8vw,40px)] font-normal leading-[1.1]">
          Дојдете да <em className="italic text-accent">го видите</em>
        </h2>
        <Button href={`/contact?project=${projectId}`} variant="primary" tone="dark">
          Контактирај за овој проект
        </Button>
      </div>
    </section>
  );
}
