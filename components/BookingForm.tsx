"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { ConsultationRequest } from "@/types";
import { projects } from "@/data";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface BookingFormProps {
  defaultValues?: Partial<ConsultationRequest>;
  kind?: ConsultationRequest["kind"];
  compact?: boolean;
}

const inputClass = "min-h-12 w-full border border-line bg-warm-white px-3.5 py-2.5 text-base focus-ring";
const labelClass = "eyebrow text-ink/50";

// Real weekday business hours (see companyInfo.hours: "Пон–Пет 09:00–18:00"),
// offered as discrete slots rather than a native time input, which renders
// inconsistently across browsers and reads as an afterthought on mobile.
// Split into two genuine groups — before/after midday — rather than one long
// run of 19 buttons, so the grid stays scannable at a glance.
function timeSlots(startHour: number, endHour: number) {
  const out: string[] = [];
  for (let m = startHour * 60; m < endHour * 60; m += 30) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return out;
}
const MORNING_SLOTS = timeSlots(9, 13);
const AFTERNOON_SLOTS = [...timeSlots(13, 18), "18:00"];

export function BookingForm({ defaultValues, kind = "consultation", compact = false }: BookingFormProps) {
  const [values, setValues] = useState<ConsultationRequest>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    project: defaultValues?.project ?? "",
    buildingId: defaultValues?.buildingId ?? "",
    apartmentId: defaultValues?.apartmentId ?? "",
    message: defaultValues?.message ?? "",
    kind,
    ...defaultValues,
  });
  const [submitted, setSubmitted] = useState(false);
  const selectedProject = projects.find((p) => p.id === values.project);

  function update<K extends keyof ConsultationRequest>(key: K, value: ConsultationRequest[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function selectProject(projectId: string) {
    // Building options are project-specific, so a stale selection from a
    // previous project would silently point at the wrong building.
    setValues((v) => ({ ...v, project: projectId, buildingId: "" }));
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 border border-line bg-warm-white p-10 text-center">
        <CheckCircle2 className="h-8 w-8 text-gold-deep" />
        <h3 className="font-display text-xl">Ви благодариме, {values.firstName}.</h3>
        <p className="max-w-sm text-sm text-ink/60">
          Ова е прототип — не беше испратена реална порака. Во продукција, ова би се испратило до нашиот CRM и календар,
          а член на нашиот тим за продажба би потврдил во рок од еден работен ден.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-5"
    >
      {(values.apartmentId || values.buildingId || values.project) && (
        <div className="border border-accent/30 bg-accent-soft/40 px-4 py-3 text-sm text-ink/70">
          Прашање за:{" "}
          <strong className="text-charcoal">
            {selectedProject?.name ?? values.project}
            {values.buildingId ? ` · ${selectedProject?.buildings?.find((b) => b.id === values.buildingId)?.name}` : ""}
            {values.apartmentId ? ` · Стан ${values.apartmentId.split("-").pop()}` : ""}
          </strong>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className={labelClass}>Име *</span>
          <input
            required
            autoComplete="given-name"
            className={inputClass}
            value={values.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Презиме *</span>
          <input
            required
            autoComplete="family-name"
            className={inputClass}
            value={values.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Е-пошта *</span>
          <input
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            className={inputClass}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Телефон *</span>
          <input
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className={inputClass}
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </label>

        {!compact && (
          <>
            <label className="space-y-1.5">
              <span className={labelClass}>Посакуван датум</span>
              <input
                type="date"
                className={inputClass}
                value={values.preferredDate}
                onChange={(e) => update("preferredDate", e.target.value)}
              />
            </label>
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-baseline justify-between">
                <span className={labelClass}>Посакувано време</span>
                <span className="text-xs text-ink/40">
                  {values.preferredTime ? (
                    <>
                      Избрано: <span className="font-medium text-charcoal">{values.preferredTime}</span>
                    </>
                  ) : (
                    "по избор"
                  )}
                </span>
              </div>
              <div role="radiogroup" aria-label="Посакувано време" className="space-y-3">
                <TimeSlotRow
                  label="Претпладне"
                  slots={MORNING_SLOTS}
                  value={values.preferredTime}
                  onChange={(t) => update("preferredTime", t)}
                />
                <TimeSlotRow
                  label="Попладне"
                  slots={AFTERNOON_SLOTS}
                  value={values.preferredTime}
                  onChange={(t) => update("preferredTime", t)}
                />
              </div>
            </div>
          </>
        )}

        <label className="space-y-1.5">
          <span className={labelClass}>Проект од интерес</span>
          <select className={inputClass} value={values.project} onChange={(e) => selectProject(e.target.value)}>
            <option value="">Изберете проект</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        {/* Building options are data-driven per project — only projects that
            actually model multiple buildings (currently City Center) show this field. */}
        {selectedProject?.buildings && selectedProject.buildings.length > 0 && (
          <label className="space-y-1.5">
            <span className={labelClass}>Зграда од интерес</span>
            <select
              className={inputClass}
              value={values.buildingId}
              onChange={(e) => update("buildingId", e.target.value)}
            >
              <option value="">Било која зграда</option>
              {selectedProject.buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="block space-y-1.5">
        <span className={labelClass}>Порака</span>
        <textarea
          rows={4}
          className={inputClass}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </label>

      <Button type="submit" className="w-full sm:w-auto">
        {kind === "call-request"
          ? "Побарај повик"
          : kind === "info-request"
            ? "Побарај повеќе информации"
            : kind === "apartment-inquiry"
              ? "Испрати прашање"
              : "Закажи консултација"}
      </Button>
    </form>
  );
}

function TimeSlotRow({
  label,
  slots,
  value,
  onChange,
}: {
  label: string;
  slots: string[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs text-ink/50">{label}</div>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
        {slots.map((t) => {
          const isSelected = value === t;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(isSelected ? "" : t)}
              className={cn(
                "focus-ring min-h-11 border px-2 py-2 text-center text-base tabular-nums transition-colors active:scale-95 sm:text-sm",
                isSelected
                  ? "border-accent bg-accent/10 font-medium text-charcoal"
                  : "border-line text-ink/70 hover:border-accent/50"
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
