"use client";

import { useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type Interest = "apartment" | "commercial" | "parking";

const INTERESTS: { id: Interest; label: string }[] = [
  { id: "apartment", label: "Стан" },
  { id: "commercial", label: "Деловен простор" },
  { id: "parking", label: "Паркинг" },
];
const ROOMS = ["1", "2", "3", "4+"];
const TIMES = ["10:00", "12:00", "15:00", "17:00"];
const WEEKDAYS = ["Нед", "Пон", "Вто", "Сре", "Чет", "Пет", "Саб"];
const WORKING_DAYS = 5;

const pad = (n: number) => String(n).padStart(2, "0");
const localKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "Today" as a string snapshot, so the server renders no days (its clock and time zone are not the
// visitor's) and the browser fills them in on hydration without a mismatch.
const subscribeNever = () => () => {};
const todayKey = () => localKey(new Date());
const noToday = () => "";

/** The next five working days (Mon–Fri) after `key`, as { key, weekday, day, date }. */
function nextWorkingDays(key: string) {
  if (!key) return [];
  const [y, m, d] = key.split("-").map(Number);
  const out: { key: string; weekday: string; day: string; date: Date }[] = [];
  const cursor = new Date(y, m - 1, d);
  while (out.length < WORKING_DAYS) {
    cursor.setDate(cursor.getDate() + 1);
    const dow = cursor.getDay();
    if (dow === 0 || dow === 6) continue;
    out.push({ key: localKey(cursor), weekday: WEEKDAYS[dow], day: pad(cursor.getDate()), date: new Date(cursor) });
  }
  return out;
}

type Errors = Partial<Record<"name" | "phone" | "when", string>>;

const chip = (selected: boolean) =>
  cn(
    "focus-ring min-h-11 border px-4 py-2 text-sm transition-colors",
    selected ? "border-gold bg-gold font-medium text-ink" : "border-ink/20 text-ink hover:border-gold"
  );

/**
 * Guided consultation request: what you're after, how many rooms, which day and time, then name and
 * phone. Like the site's other forms it is a prototype — it validates and confirms, nothing is sent yet.
 */
export function GuidedBooking({
  initialInterest = "apartment",
  initialRooms,
  reference,
}: {
  initialInterest?: Interest;
  initialRooms?: string;
  /** What the visitor came from, e.g. "Стан 203 · Зграда 03 · City Center". */
  reference?: string;
}) {
  const [interest, setInterest] = useState<Interest>(initialInterest);
  const [rooms, setRooms] = useState(initialRooms ?? "");
  const [dayKey, setDayKey] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const whenRef = useRef<HTMLFieldSetElement>(null);

  const today = useSyncExternalStore(subscribeNever, todayKey, noToday);
  const days = useMemo(() => nextWorkingDays(today), [today]);
  const day = days.find((d) => d.key === dayKey);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Внесете го вашето име и презиме.";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15 || !/^[+\d\s()/-]+$/.test(phone)) {
      next.phone = "Внесете валиден телефонски број.";
    }
    if (!day || !time) next.when = "Изберете ден и време.";
    setErrors(next);
    if (next.name) nameRef.current?.focus();
    else if (next.when) whenRef.current?.scrollIntoView({ block: "center" });
    else if (next.phone) phoneRef.current?.focus();
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done && day) {
    const interestLabel = INTERESTS.find((i) => i.id === interest)?.label ?? "";
    return (
      <div role="status" className="border border-ink/12 p-8 sm:p-10">
        <CheckCircle2 className="h-8 w-8 text-gold-deep" />
        <h2 className="mt-4 font-display text-2xl">Ви благодариме, {name.trim()}.</h2>
        <p className="mt-3 text-base leading-relaxed text-ink/80">
          Консултација за {interestLabel.toLowerCase()}
          {interest === "apartment" && rooms ? ` (${rooms} ${rooms === "1" ? "соба" : "соби"})` : ""} —{" "}
          <strong className="font-medium text-ink">
            {day.weekday} {day.day}.{pad(day.date.getMonth() + 1)}, {time}
          </strong>
          .
        </p>
        {reference && <p className="mt-2 text-base text-ink/70">Прашање за: {reference}</p>}
        <p className="mt-4 max-w-md text-sm text-ink/60">
          Ова е прототип — не беше испратена реална порака. Во продукција, барањето би стигнало до нашиот тим за
          продажба, кој би го потврдил терминот.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="focus-ring mt-6 min-h-11 text-sm underline underline-offset-4"
        >
          Измени го барањето
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-9">
      {reference && (
        <div className="border border-gold/40 bg-gold/10 px-4 py-3 text-base text-ink/80">
          Прашање за: <strong className="font-medium text-ink">{reference}</strong>
        </div>
      )}

      <fieldset>
        <legend className="eyebrow mb-3 text-gold-deep">Што ве интересира?</legend>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button
              key={i.id}
              type="button"
              aria-pressed={interest === i.id}
              onClick={() => setInterest(i.id)}
              className={chip(interest === i.id)}
            >
              {i.label}
            </button>
          ))}
        </div>
      </fieldset>

      {interest === "apartment" && (
        <fieldset>
          <legend className="eyebrow mb-3 text-gold-deep">Колку соби?</legend>
          <div className="flex flex-wrap gap-2">
            {ROOMS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={rooms === r}
                onClick={() => setRooms(rooms === r ? "" : r)}
                className={cn(chip(rooms === r), "min-w-12")}
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset ref={whenRef} aria-describedby={errors.when ? "when-error" : undefined}>
        <legend className="eyebrow mb-3 text-gold-deep">Изберете ден</legend>
        <div className="grid grid-cols-5 gap-2">
          {days.length === 0
            ? Array.from({ length: WORKING_DAYS }, (_, i) => (
                <div key={i} aria-hidden className="h-[68px] border border-ink/10" />
              ))
            : days.map((d) => {
                const selected = dayKey === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${d.weekday} ${d.day}.${pad(d.date.getMonth() + 1)}`}
                    onClick={() => setDayKey(d.key)}
                    className={cn(
                      "focus-ring flex min-h-[68px] flex-col items-center justify-center border px-1 py-2 text-xs transition-colors",
                      selected ? "border-ink bg-ink text-gold" : "border-ink/20 hover:border-gold"
                    )}
                  >
                    <span className="mono-stat text-lg leading-none" style={{ letterSpacing: 0 }}>
                      {d.day}
                    </span>
                    <span className="mt-1.5">{d.weekday}</span>
                  </button>
                );
              })}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {TIMES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={time === t}
              onClick={() => setTime(t)}
              className={cn(chip(time === t), "mono-stat")}
              style={{ letterSpacing: 0 }}
            >
              {t}
            </button>
          ))}
        </div>
        {errors.when && (
          <p id="when-error" role="alert" className="mt-2 text-sm text-ink">
            {errors.when}
          </p>
        )}
      </fieldset>

      <div className="space-y-6">
        <div>
          <label htmlFor="gb-name" className="eyebrow text-gold-deep">
            Име и презиме
          </label>
          <input
            ref={nameRef}
            id="gb-name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "gb-name-error" : undefined}
            className="mt-2 min-h-12 w-full border-0 border-b border-ink/30 bg-transparent py-2 text-base font-light text-ink outline-none transition-colors focus:border-gold"
          />
          {errors.name && (
            <p id="gb-name-error" role="alert" className="mt-1.5 text-sm text-ink">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="gb-phone" className="eyebrow text-gold-deep">
            Телефон
          </label>
          <input
            ref={phoneRef}
            id="gb-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "gb-phone-error" : undefined}
            className="mt-2 min-h-12 w-full border-0 border-b border-ink/30 bg-transparent py-2 text-base font-light text-ink outline-none transition-colors focus:border-gold"
          />
          {errors.phone && (
            <p id="gb-phone-error" role="alert" className="mt-1.5 text-sm text-ink">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="focus-ring min-h-12 w-full bg-gold px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-gold-light sm:w-auto"
      >
        Закажи
      </button>
    </form>
  );
}
