"use client";

import { useMemo, useRef, useState, useSyncExternalStore, type AnimationEvent, type FormEvent } from "react";
import { useGSAP } from "@gsap/react";
import { X } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { cn } from "@/lib/cn";
import { Arrow } from "@/components/black/Arrow";
import { RadioGroup } from "./RadioGroup";
import { BookingConfirmation } from "./BookingConfirmation";
import { buildSlots, nextWorkingDays, todayIso } from "./booking-config";
import { sendBooking, type BookingRequest } from "./send-booking";

export type Interest = "apartment" | "commercial" | "parking";

const INTERESTS: { id: Interest; label: string }[] = [
  { id: "apartment", label: "Стан" },
  { id: "commercial", label: "Деловен простор" },
  { id: "parking", label: "Паркинг" },
];
const ROOMS = ["1", "2", "3", "4+"];
const SLOTS = buildSlots();

type Reference = { label: string; project?: string; building?: string; apartment?: string };
type Field = "interest" | "rooms" | "when" | "name" | "phone";
type Errors = Partial<Record<Field, string>>;

const MESSAGES: Record<Field, string> = {
  interest: "Изберете што ве интересира.",
  rooms: "Изберете колку соби.",
  when: "Изберете ден и час.",
  name: "Внесете име и презиме.",
  phone: "Внесете телефон со најмалку 8 цифри.",
};

// "Today" in the booking time zone as a string snapshot: the server renders no days (its clock is not the
// visitor's), the browser fills them in on hydration, and a cached page can never show old dates.
const subscribeNever = () => () => {};
const noToday = () => "";

const roomsLabel = (rooms: string) => `${rooms} ${rooms === "1" ? "соба" : "соби"}`;

/** Slides a field 6px each way once, gently, to point at what is missing. */
function shake(el: Element | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { x: 0 },
    { keyframes: [{ x: -6 }, { x: 6 }, { x: -4 }, { x: 4 }, { x: 0 }], duration: 0.4, ease: "power1.inOut" }
  );
}

/** A step's hairline: drawn from the left as the step scrolls into view. */
function StepRule() {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    gsap.to(el, {
      scaleX: 1,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });
  return <span ref={ref} aria-hidden className="ct-rule" />;
}

/**
 * The guided booking form: what you are after, how many rooms (apartments only), which day and time, then
 * name and phone. The days are the next five working days, computed in the browser every time the page opens.
 */
export function ContactForm({
  initialInterest,
  initialRooms,
  reference,
  phone: officePhone,
}: {
  /** Set when the visitor arrives from an apartment or project page; otherwise nothing is pre-selected. */
  initialInterest?: Interest;
  initialRooms?: string;
  reference?: Reference;
  /** The office phone, shown if sending fails. */
  phone: string;
}) {
  const startsWithRooms = initialInterest === "apartment";
  const [interest, setInterest] = useState<Interest | "">(initialInterest ?? "");
  const [rooms, setRooms] = useState(initialRooms ?? "");
  const [dayIso, setDayIso] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showReference, setShowReference] = useState(Boolean(reference));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "failed">("idle");
  const [confirmation, setConfirmation] = useState<{ open: boolean; summary: string }>({ open: false, summary: "" });
  // The rooms step stays mounted while it fades out (0.3s), so the numbers below follow it, not the choice.
  const [roomsMounted, setRoomsMounted] = useState(startsWithRooms);
  const isApartment = interest === "apartment";
  if (isApartment && !roomsMounted) setRoomsMounted(true);

  const form = useRef<HTMLFormElement>(null);

  const today = useSyncExternalStore(subscribeNever, () => todayIso(), noToday);
  const days = useMemo(() => nextWorkingDays(today), [today]);
  const day = days.find((d) => d.iso === dayIso);

  const summary = [
    INTERESTS.find((i) => i.id === interest)?.label,
    isApartment && rooms ? roomsLabel(rooms) : undefined,
    day?.label,
    time || undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  const clear = (field: Field) => setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));

  function reset() {
    setInterest(initialInterest ?? "");
    setRooms(initialRooms ?? "");
    setDayIso("");
    setTime("");
    setName("");
    setPhone("");
    setShowReference(Boolean(reference));
    setErrors({});
    setStatus("idle");
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!interest) next.interest = MESSAGES.interest;
    if (isApartment && !rooms) next.rooms = MESSAGES.rooms;
    if (!day || !time) next.when = MESSAGES.when;
    if (name.trim().length < 2) next.name = MESSAGES.name;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15 || !/^[+\d\s()/.-]+$/.test(phone.trim())) next.phone = MESSAGES.phone;
    return next;
  }

  /** Scrolls to the first missing step, moves focus into it and shakes it once. */
  function showFirstError(next: Errors) {
    const first = (["interest", "rooms", "when", "name", "phone"] as Field[]).find((f) => next[f]);
    const root = form.current;
    if (!first || !root) return;
    const step = root.querySelector<HTMLElement>(`[data-step="${first}"]`);
    if (!step) return;
    // For the day-and-time step, focus the group that is still empty.
    const group = first === "when" ? (dayIso ? "time" : "day") : first;
    const target =
      first === "name" || first === "phone"
        ? step.querySelector<HTMLElement>("input")
        : step.querySelector<HTMLElement>(`[data-group="${group}"] [role="radio"][tabindex="0"]`);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(step, { offset: -140, duration: 0.9 });
    else step.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    target?.focus({ preventScroll: true });
    shake(step.querySelector(first === "name" || first === "phone" ? ".ct-field" : "[data-shake]") ?? step);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      showFirstError(next);
      return;
    }
    if (!interest || !day) return;
    const request: BookingRequest = {
      interest: INTERESTS.find((i) => i.id === interest)?.label ?? interest,
      rooms: isApartment ? rooms : undefined,
      date: day.iso,
      dateLabel: day.label,
      time,
      name: name.trim(),
      phone: phone.trim(),
      reference: showReference ? reference : undefined,
    };
    setStatus("sending");
    try {
      await sendBooking(request);
      setStatus("idle");
      setConfirmation({ open: true, summary });
    } catch {
      setStatus("failed");
    }
  }

  // Step numbers follow what is on screen: without the rooms step the rest are 01, 02, 03.
  let number = 0;
  const n = () => String(++number).padStart(2, "0");
  const describe = (field: Field) => (errors[field] ? `ct-err-${field}` : undefined);
  const error = (field: Field) =>
    errors[field] ? (
      <p id={`ct-err-${field}`} className="ct-error">
        {errors[field]}
      </p>
    ) : null;

  return (
    <>
      <form ref={form} className="ct-form" noValidate onSubmit={onSubmit} aria-label="Закажете консултација">
        {reference && showReference && (
          <div className="ct-tag bk-mono">
            <span>За: {reference.label}</span>
            <button type="button" onClick={() => setShowReference(false)} aria-label="Отстрани ја референцата">
              <X className="h-4 w-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        )}

        <section data-step="interest" data-seq="step" className="ct-step">
          <StepRule />
          <h2 className="ct-step-h bk-label" id="ct-h-interest">
            <b className="ct-step-n bk-mono">{n()}</b>
            <span>Што ве интересира?</span>
          </h2>
          <div data-shake>
            <RadioGroup
              groupId="interest"
              label="Што ве интересира?"
              className="ct-chips"
              itemClassName="ct-chip"
              describedBy={describe("interest")}
              invalid={Boolean(errors.interest)}
              value={interest}
              onChange={(v) => {
                setInterest(v as Interest);
                clear("interest");
              }}
              options={INTERESTS.map((i) => ({ value: i.id, label: i.label, content: i.label }))}
            />
          </div>
          {error("interest")}
        </section>

        {roomsMounted && (
          <section
            data-step="rooms"
            data-seq={startsWithRooms ? "step" : undefined}
            className={cn("ct-step", !isApartment ? "is-leaving" : !startsWithRooms && "is-entering")}
            onAnimationEnd={(e: AnimationEvent) => {
              if (e.target === e.currentTarget && e.animationName === "ct-fade-out" && !isApartment)
                setRoomsMounted(false);
            }}
          >
            <StepRule />
            <h2 className="ct-step-h bk-label">
              <b className="ct-step-n bk-mono">{n()}</b>
              <span>Колку соби?</span>
            </h2>
            <div data-shake>
              <RadioGroup
                groupId="rooms"
                label="Колку соби?"
                className="ct-chips"
                itemClassName="ct-chip is-mono"
                describedBy={describe("rooms")}
                invalid={Boolean(errors.rooms)}
                value={rooms}
                onChange={(v) => {
                  setRooms(v);
                  clear("rooms");
                }}
                options={ROOMS.map((r) => ({ value: r, label: roomsLabel(r), content: r }))}
              />
            </div>
            {error("rooms")}
          </section>
        )}

        <section data-step="when" data-seq="step" className="ct-step">
          <StepRule />
          <h2 className="ct-step-h bk-label">
            <b className="ct-step-n bk-mono">{n()}</b>
            <span>Изберете ден и час</span>
          </h2>
          <div data-shake>
            <div className="ct-days-box">
              {days.length > 0 && (
                <RadioGroup
                  groupId="day"
                  label="Ден"
                  className="ct-days"
                  itemClassName="ct-day"
                  describedBy={describe("when")}
                  invalid={Boolean(errors.when && !dayIso)}
                  value={dayIso}
                  onChange={(v) => {
                    setDayIso(v);
                    clear("when");
                  }}
                  options={days.map((d) => ({
                    value: d.iso,
                    label: d.label,
                    content: (
                      <>
                        <small>{d.weekday}</small>
                        <span className="ct-day-d">{d.day}</span>
                        <small>{d.month}</small>
                      </>
                    ),
                  }))}
                />
              )}
            </div>
            <RadioGroup
              groupId="time"
              label="Час"
              className="ct-slots"
              itemClassName="ct-chip is-mono"
              describedBy={describe("when")}
              invalid={Boolean(errors.when && !time)}
              value={time}
              onChange={(v) => {
                setTime(v);
                clear("when");
              }}
              options={SLOTS.map((s) => ({ value: s, label: s, content: s }))}
            />
          </div>
          {error("when")}
        </section>

        <section data-seq="step" className="ct-step">
          <StepRule />
          <h2 className="ct-step-h bk-label">
            <b className="ct-step-n bk-mono">{n()}</b>
            <span>Ваши податоци</span>
          </h2>
          <div className="ct-fields">
            <div className="ct-field" data-step="name">
              <label htmlFor="ct-name" className="bk-label">
                Име и презиме
              </label>
              <div className="ct-input">
                <input
                  id="ct-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  aria-required="true"
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={describe("name")}
                  onChange={(e) => {
                    setName(e.target.value);
                    clear("name");
                  }}
                />
              </div>
              {error("name")}
            </div>
            <div className="ct-field" data-step="phone">
              <label htmlFor="ct-phone" className="bk-label">
                Телефон
              </label>
              <div className="ct-input">
                <input
                  id="ct-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  aria-required="true"
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={describe("phone")}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clear("phone");
                  }}
                />
              </div>
              {error("phone")}
            </div>
          </div>

          <div className="ct-submit">
            <button type="submit" className="bk-btn bk-btn--fill" aria-disabled={status === "sending"}>
              {status === "sending" ? (
                "Се испраќа…"
              ) : (
                <>
                  Закажи
                  <Arrow />
                </>
              )}
            </button>
            <span className="ct-sum bk-mono" aria-live="polite">
              <span key={summary}>{summary}</span>
            </span>
          </div>
          {status === "failed" && (
            <p role="alert" className="ct-fail">
              Барањето не беше испратено. Вашите одговори се зачувани: обидете се повторно или повикајте нè на{" "}
              <a href={`tel:${officePhone.replace(/ /g, "")}`}>{officePhone}</a>.
            </p>
          )}
        </section>
      </form>

      <BookingConfirmation
        open={confirmation.open}
        summary={confirmation.summary}
        onClose={() => {
          setConfirmation((c) => ({ ...c, open: false }));
          reset();
        }}
      />
    </>
  );
}
