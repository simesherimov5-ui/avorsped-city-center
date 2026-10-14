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
      <div className="container-x section-y flex flex-wrap items-center justify-between gap-8">
        <h2 className="font-display text-[clamp(26px,2.8vw,40px)] font-normal leading-[1.1]">
          Дојдете да <em className="italic text-accent">го видите</em>
        </h2>
        <Button href={href ?? `/contact?project=${projectId}`} variant="primary" tone="dark">
          {label}
        </Button>
      </div>
    </section>
  );
}
