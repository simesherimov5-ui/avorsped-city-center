import type { Metadata } from "next";
import { BookingForm } from "@/components/BookingForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ConsultationRequest } from "@/types";

export const metadata: Metadata = {
  title: "Закажи консултација",
  description: "Закажи консултација со нашиот тим за продажба за кој било од нашите проекти.",
};

export default async function ConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; project?: string; building?: string; apartment?: string }>;
}) {
  const params = await searchParams;
  const kind = (params.kind as ConsultationRequest["kind"]) ?? "consultation";

  return (
    <div className="pt-24 sm:pt-28">
      <section className="mx-auto max-w-2xl px-5 sm:px-8 py-16 lg:px-10">
        <SectionHeading
          eyebrow="Стапете во контакт"
          title={kind === "apartment-inquiry" ? "Прашај за овој стан" : "Закажи консултација"}
          description="Разговарајте со нашиот тим за продажба за кој било од нашите проекти. Овој формулар е прототип — пораките сè уште не се испраќаат никаде."
        />
        <div className="mt-10">
          <BookingForm
            kind={kind}
            defaultValues={{
              project: params.project,
              buildingId: params.building,
              apartmentId: params.apartment,
            }}
          />
        </div>
      </section>
    </div>
  );
}
