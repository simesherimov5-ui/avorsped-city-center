import { Button } from "@/components/ui/Button";

/**
 * The invitation that closes a project page: "Дојдете да го видите", on Оникс, with the filling button to the form for
 * this project.
 */
export function ProjectCta({
  projectId,
  label = "Контактирај за овој проект",
  href,
}: {
  projectId: string;
  label?: string;
  href?: string;
}) {
  return (
    <section className="bg-chrome text-on-chrome">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <h2 className="font-display text-(length:--fs-h2) font-normal leading-[1.2]">Дојдете да го видите</h2>
        <Button href={href ?? `/contact?project=${projectId}`} variant="primary" tone="dark">
          {label}
        </Button>
      </div>
    </section>
  );
}
