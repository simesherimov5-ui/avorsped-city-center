import { BookBand } from "@/components/project/BookBand";
import { ProjectSection } from "@/components/project/SectionHead";
import type { Project } from "@/types";

/**
 * "Закажете средба": a short invitation and the buttons that open Контакт with this project already chosen and (with
 * `scrollTarget`, the id of a section of the page) scroll to the building picker.
 */
export function ProjectBook({ project, scrollTarget }: { project: Project; scrollTarget?: string }) {
  const book = project.book;
  if (!book) return null;
  // "City Center" never breaks between its two words
  const title = `${book.title}${book.titleItalic}`.replace(/City Center/g, "City Center");
  return (
    <ProjectSection id="book" label="Закажете средба" tone="dark">
      <BookBand
        eyebrow="ЗАКАЖЕТЕ СРЕДБА"
        title={title}
        text={book.text}
        primaryHref={`/contact?project=${encodeURIComponent(project.id)}`}
        scrollTarget={scrollTarget}
      />
    </ProjectSection>
  );
}
