import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ProjectSection, SectionHead } from "@/components/project/SectionHead";
import type { Project } from "@/types";

/** "Закажете средба": a short invitation and the large button that opens Контакт with this project already chosen. */
export function ProjectBook({ project }: { project: Project }) {
  const book = project.book;
  if (!book) return null;
  return (
    <ProjectSection id="book" label="Закажете средба" tone="dark">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHead eyebrow="ЗАКАЖЕТЕ СРЕДБА" title={book.title} titleItalic={book.titleItalic}>
            <p className="m-0 max-w-[62ch] text-base leading-[1.8] text-ink/80">{book.text}</p>
          </SectionHead>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="lg:flex lg:justify-end">
            <Button
              href={`/contact?project=${encodeURIComponent(project.id)}`}
              variant="primary"
              tone="dark"
              className="w-full sm:w-auto"
            >
              ЗАКАЖЕТЕ КОНСУЛТАЦИЈА
            </Button>
          </div>
        </Reveal>
      </div>
    </ProjectSection>
  );
}
