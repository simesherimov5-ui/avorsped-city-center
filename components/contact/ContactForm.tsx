"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { AreaSlider } from "./AreaSlider";
import { RadioGroup } from "./RadioGroup";
import { BookingConfirmation } from "./BookingConfirmation";
import { AREA, buildSlots, nextWorkingDays, todayIso } from "./booking-config";
import { isValidEmail, isValidName, isValidPhone, sanitizePhone } from "./booking-validate";
import { areaOf, sendBooking, type BookingRequest } from "./send-booking";

/** A project the visitor can ask about. Passed in by the page, from the data. */
export type ProjectOption = { id: string; name: string };
/** Set when the visitor arrives from a project page (an apartment or building in the link only tells us the project). */
export type BookingStart = { projectId?: string };

type StepId = "project" | "area" | "when" | "details";
type Field = "name" | "phone" | "email";
type Errors = Partial<Record<Field, string>>;

const SLOTS = buildSlots();
/** The «not sure yet» answer to the first question: no project, and the visitor is advised at the meeting. */
const UNDECIDED = "undecided";
const MESSAGES: Record<Field, string> = {
  name: "Внесете име и презиме.",
  phone: "Внесете телефонски број со најмалку 8 цифри.",
  email: "Внесете валидна е-пошта",
};
/** The question of each step (the first and the third keep their question as heading, as before). */
const TITLES: Record<StepId, string> = {
  project: "Каде барате?",
  area: "Колкава површина ви е потребна?",
  when: "Изберете ден и час",
  details: "Како да ве контактираме?",
};
/** What an answered row calls its step. */
const ROW_LABELS: Record<StepId, string> = {
  project: "Каде барате?",
  area: "Површина",
  when: "Изберете ден и час",
  details: "Контакт",
};
/** The small label above the heading of the area and contact steps. */
const EYEBROWS: Partial<Record<StepId, string>> = { area: "ПОВРШИНА", details: "КОНТАКТ" };

// "Today" in the booking time zone as a string snapshot: the server renders no days (its clock is not the
// visitor's), the browser fills them in on hydration, and a cached page can never show old dates.
const subscribeNever = () => () => {};
const noToday = () => "";

/** Slides a field 6px each way once, gently, to point at what is missing. */
function shake(el: Element | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { x: 0 },
    { keyframes: [{ x: -6 }, { x: 6 }, { x: -4 }, { x: 4 }, { x: 0 }], duration: 0.4, ease: "power1.inOut" }
  );
}

/**
 * Opens and closes its content with the height animating (no jump). `enter` is the slower arrival of a whole new step
 * (it also rises 12px); otherwise it is the quick 0.3s of a collapse. With reduced motion it is instant.
 */
function Collapse({
  show,
  reduce,
  enter = false,
  children,
}: {
  show: boolean;
  reduce: boolean;
  enter?: boolean;
  children: ReactNode;
}) {
  const t = reduce ? 0 : enter ? 0.45 : 0.3;
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key="content"
          className="ct-collapse"
          initial={reduce ? false : { height: 0, opacity: 0, y: enter ? 12 : 0 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: 0 }}
          transition={{ duration: t, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The guided booking form. It asks one thing at a time: the project, the area range the visitor wants (so sales knows
 * what to prepare), the day and time, then name and phone. An answered step folds into one summary row with «Измени»,
 * which jumps straight back to that step; afterwards the form returns to the first step still unanswered. Nothing
 * depends on anything else, so changing an answer never clears another.
 */
export function ContactForm({
  projects,
  start,
  phone: officePhone,
}: {
  projects: ProjectOption[];
  /** Set when the visitor arrives from a project (or apartment) page. */
  start?: BookingStart;
  /** The office phone, shown if sending fails. */
  phone: string;
}) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [projectId, setProjectId] = useState(projects.some((p) => p.id === start?.projectId) ? start!.projectId! : "");
  const [undecided, setUndecided] = useState(false);
  const [areaLow, setAreaLow] = useState<number>(AREA.defaultMin);
  const [areaHigh, setAreaHigh] = useState<number>(AREA.defaultMax);
  const [areaUnknown, setAreaUnknown] = useState(false);
  // The area step is answered when the visitor confirms it (the default range is only a starting point).
  const [areaDone, setAreaDone] = useState(false);
  const [dayIso, setDayIso] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // Optional: empty is fine, but a given address must be valid.
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState<StepId | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "failed">("idle");
  const [confirmation, setConfirmation] = useState<{ open: boolean; summary: string }>({ open: false, summary: "" });

  const form = useRef<HTMLFormElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);

  const today = useSyncExternalStore(subscribeNever, () => todayIso(), noToday);
  const days = useMemo(() => nextWorkingDays(today), [today]);
  const day = days.find((d) => d.iso === dayIso);

  const project = projects.find((p) => p.id === projectId);
  const areaText = areaOf({
    areaMin: areaLow,
    areaMax: areaHigh,
    areaUnknown,
  });

  // Which steps are answered, and so which are on screen: every step up to the first unanswered one.
  const order: StepId[] = ["project", "area", "when", "details"];
  const answered: Record<StepId, boolean> = {
    project: Boolean(project) || undecided,
    area: areaDone,
    when: Boolean(day && time),
    details: false,
  };
  const visible: StepId[] = [];
  for (const id of order) {
    visible.push(id);
    if (!answered[id]) break;
  }
  const firstOpen = visible.find((id) => !answered[id]) ?? "details";
  const openId: StepId = editing && visible.includes(editing) ? editing : firstOpen;

  const summaryOf = (id: StepId) => {
    if (id === "project") return undecided ? "Сè уште не знам" : (project?.name ?? "");
    if (id === "area") return areaUnknown ? "Сè уште не знам" : areaText.replace("–", " – ");
    if (id === "when") return [day?.label, time].filter(Boolean).join(" · ");
    return "";
  };
  const summary = [
    undecided ? "Проект: не е избран" : project?.name,
    `Површина: ${areaText}`,
    day?.label,
    time || undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  // ---- answers (nothing depends on anything else, so each one only sets itself)
  const pickProject = (id: string) => {
    const next = id === UNDECIDED;
    setUndecided(next);
    setProjectId(next ? "" : id);
    setEditing(null);
  };
  const moveArea = (low: number, high: number) => {
    setAreaLow(low);
    setAreaHigh(high);
  };
  const confirmArea = () => {
    setAreaDone(true);
    setEditing(null);
  };
  const pickDay = (iso: string) => {
    setDayIso(iso);
    if (iso !== dayIso) setTime("");
  };
  const pickTime = (value: string) => {
    setTime(value);
    setEditing(null);
  };

  // ---- a step that has just opened: scroll it into view (below the header) and move focus into it
  const seen = useRef<StepId | null>(null);
  useEffect(() => {
    if (seen.current === null) {
      seen.current = openId; // the first showing: nothing to reveal
      return;
    }
    if (seen.current === openId) return;
    seen.current = openId;
    const timer = window.setTimeout(
      () => {
        const step = form.current?.querySelector<HTMLElement>(`[data-step="${openId}"]`);
        if (!step) return;
        const header = document.querySelector("header");
        const headerH = header ? header.getBoundingClientRect().height : 0;
        const rect = step.getBoundingClientRect();
        if (rect.top < headerH + 16 || rect.bottom > window.innerHeight - 8) {
          const y = rect.top + window.scrollY - headerH - 24;
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(y, { duration: reduce ? 0 : 0.9, immediate: reduce });
          else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
        }
        step.querySelector<HTMLElement>('[role="radio"][tabindex="0"], input')?.focus({ preventScroll: true });
      },
      reduce ? 0 : 340
    );
    return () => window.clearTimeout(timer);
  }, [openId, reduce]);

  const clearError = (field: Field) => setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));

  function reset() {
    setProjectId(projects.some((p) => p.id === start?.projectId) ? start!.projectId! : "");
    setUndecided(false);
    setAreaLow(AREA.defaultMin);
    setAreaHigh(AREA.defaultMax);
    setAreaUnknown(false);
    setAreaDone(false);
    setDayIso("");
    setTime("");
    setName("");
    setPhone("");
    setEmail("");
    setEditing(null);
    setErrors({});
    setStatus("idle");
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!isValidName(name)) next.name = MESSAGES.name;
    if (!isValidPhone(phone)) next.phone = MESSAGES.phone;
    if (email.trim() && !isValidEmail(email.trim())) next.email = MESSAGES.email;
    return next;
  }

  /** Moves focus into the first field that is missing and shakes it once. */
  function showFirstError(next: Errors) {
    const first = (["name", "phone", "email"] as Field[]).find((f) => next[f]);
    const field = first && form.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    if (!first || !field) return;
    field.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
    const header = document.querySelector("header");
    const y =
      field.getBoundingClientRect().top + window.scrollY - (header ? header.getBoundingClientRect().height : 0) - 120;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 0.9 });
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    shake(field);
  }

  // «Закажи» looks disabled until the name and phone are good (and the e-mail, if given), but stays clickable
  // (aria-disabled), so pressing it (or Enter in a field) can say what is missing under the field.
  const canSend = isValidName(name) && isValidPhone(phone) && (!email.trim() || isValidEmail(email.trim()));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      showFirstError(next);
      return;
    }
    // every earlier step must be answered (they always are once this step is on screen)
    if (!day || !time || !areaDone || (!undecided && !project)) return;
    const request: BookingRequest = {
      project: undecided ? null : project!.name,
      projectId: undecided ? null : project!.id,
      undecided,
      areaMin: areaUnknown ? null : areaLow,
      areaMax: areaUnknown ? null : areaHigh,
      areaUnknown,
      date: day.iso,
      dateLabel: day.label,
      time,
      name: name.trim(),
      phone: phone.trim(),
      ...(email.trim() ? { email: email.trim() } : {}),
    };
    setStatus("sending");
    // The button is really disabled while sending, which drops focus; it gets focus back (once enabled again)
    // before the pop-up opens, so the pop-up can return focus to it when it closes.
    const settle = (next: "idle" | "failed") => {
      flushSync(() => setStatus(next));
      submitButton.current?.focus({ preventScroll: true });
    };
    try {
      await sendBooking(request);
      settle("idle");
      setConfirmation({ open: true, summary });
    } catch {
      settle("failed");
    }
  }

  const describe = (field: Field) => (errors[field] ? `ct-err-${field}` : undefined);
  const error = (field: Field) =>
    errors[field] ? (
      <p id={`ct-err-${field}`} className="ct-error">
        {errors[field]}
      </p>
    ) : null;

  /** One step: a summary row when answered and closed, the question itself when open, nothing before its turn. */
  const step = (id: StepId, body: ReactNode, note?: ReactNode, help?: string) => {
    const index = visible.indexOf(id);
    if (index < 0) return null;
    const number = String(index + 1).padStart(2, "0");
    const isOpen = openId === id;
    const isFolded = !isOpen && answered[id];
    const eyebrow = EYEBROWS[id];
    return (
      <div key={id} className="ct-step-wrap" data-step-wrap={id}>
        <Collapse show={isOpen} reduce={reduce} enter>
          <section data-step={id} className="ct-step" aria-labelledby={`ct-h-${id}`}>
            {eyebrow ? (
              <div className="ct-step-h2">
                <div className="ct-eyebrow">
                  {number} · {eyebrow}
                </div>
                <h2 id={`ct-h-${id}`} className="ct-step-title">
                  {TITLES[id]}
                </h2>
                {help && <p className="ct-step-help">{help}</p>}
              </div>
            ) : (
              <div className="ct-step-h bk-label" id={`ct-h-${id}`} role="heading" aria-level={2}>
                <b className="ct-step-n bk-mono">{number}</b>
                <span>{TITLES[id]}</span>
              </div>
            )}
            {body}
          </section>
        </Collapse>
        <Collapse show={isFolded} reduce={reduce}>
          <div className="ct-step ct-sumrow">
            <b className="ct-step-n bk-mono">{number}</b>
            <span className="ct-sumrow-label bk-label">{ROW_LABELS[id]}</span>
            <span className="ct-sumrow-value">{summaryOf(id)}</span>
            <button
              type="button"
              className="ct-edit"
              aria-label={`Измени: ${ROW_LABELS[id]}`}
              onClick={() => setEditing(id)}
            >
              Измени
            </button>
          </div>
        </Collapse>
        {note !== undefined && (
          <Collapse show={Boolean(note) && isFolded} reduce={reduce}>
            <p className="ct-note">{note}</p>
          </Collapse>
        )}
      </div>
    );
  };

  // How far along: the share of the four steps answered (all of it once the booking is sent).
  const progress = confirmation.open ? 1 : order.filter((id) => answered[id]).length / order.length;

  return (
    <>
      <form
        ref={form}
        className="ct-panel ct-form"
        data-seq="step"
        noValidate
        onSubmit={onSubmit}
        aria-label="Закажете консултација"
      >
        <div className="ct-progress" aria-hidden>
          <i style={{ transform: `scaleX(${progress})` }} />
        </div>
        <p className="ct-lead">Неколку кратки чекори. Ние ќе ви се јавиме за потврда на терминот.</p>

        {step(
          "project",
          <RadioGroup
            groupId="project"
            label={TITLES.project}
            className="ct-chips"
            itemClassName="ct-chip"
            stagger
            value={undecided ? UNDECIDED : projectId}
            onChange={pickProject}
            options={[
              ...projects.map((p) => ({ value: p.id, label: p.name, content: p.name })),
              {
                value: UNDECIDED,
                label: "Сè уште не знам",
                content: "Сè уште не знам",
                className: "is-secondary",
              },
            ]}
          />,
          undecided ? "Нема проблем – на консултацијата заедно ќе ги разгледаме сите проекти." : null
        )}

        {step(
          "area",
          <>
            <AreaSlider
              low={areaLow}
              high={areaHigh}
              unknown={areaUnknown}
              onRange={moveArea}
              onUnknown={setAreaUnknown}
            />
            <div className="ct-area-actions">
              <button
                type="button"
                className="btn-secondary"
                data-tone="dark"
                aria-pressed={areaUnknown}
                onClick={() => setAreaUnknown((v) => !v)}
              >
                Сè уште не знам
              </button>
              <button type="button" className="ct-btn ct-btn--sm" onClick={confirmArea}>
                <span>Продолжи</span>
                <span aria-hidden className="ct-btn__arrow">
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M0 4h13M9 1l4 3-4 3" />
                  </svg>
                </span>
              </button>
            </div>
          </>,
          undefined,
          "Поместете ги двата граничника. Нашиот тим ќе подготви станови во овој опсег."
        )}

        {step(
          "when",
          <>
            <div className="ct-days-box">
              {days.length > 0 && (
                <RadioGroup
                  groupId="day"
                  label="Ден"
                  className="ct-days"
                  itemClassName="ct-day"
                  stagger
                  value={dayIso}
                  onChange={pickDay}
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
            <Collapse show={Boolean(day)} reduce={reduce}>
              <RadioGroup
                groupId="time"
                label="Час"
                className="ct-slots"
                itemClassName="ct-chip is-mono"
                stagger
                value={time}
                onChange={pickTime}
                options={SLOTS.map((s) => ({ value: s, label: s, content: s }))}
              />
            </Collapse>
          </>
        )}

        {step(
          "details",
          <>
            <div className="ct-fields">
              <div className="ct-field" data-field="name">
                <label htmlFor="ct-name" className="ct-field-label">
                  ИМЕ И ПРЕЗИМЕ
                </label>
                <div className="ct-input">
                  <input
                    id="ct-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    value={name}
                    aria-required="true"
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={describe("name")}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("name");
                    }}
                  />
                </div>
                {error("name")}
              </div>
              <div className="ct-field" data-field="phone">
                <label htmlFor="ct-phone" className="ct-field-label">
                  ТЕЛЕФОН
                </label>
                <div className="ct-input">
                  <input
                    id="ct-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+389 7_ ___ ___"
                    value={phone}
                    aria-required="true"
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={describe("phone")}
                    onChange={(e) => {
                      // numbers only, as typed or pasted
                      setPhone(sanitizePhone(e.target.value));
                      clearError("phone");
                    }}
                  />
                </div>
                {error("phone")}
              </div>
              <div className="ct-field ct-field--wide" data-field="email">
                <label htmlFor="ct-email" className="ct-field-label">
                  Е-ПОШТА
                </label>
                <div className="ct-input">
                  <input
                    id="ct-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="ime@primer.com"
                    maxLength={254}
                    value={email}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={describe("email")}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                  />
                </div>
                {error("email")}
              </div>
            </div>

            <div className="ct-submit">
              <button
                ref={submitButton}
                type="submit"
                className="ct-btn"
                data-tone="dark"
                disabled={status === "sending"}
                aria-disabled={canSend ? undefined : true}
                aria-busy={status === "sending"}
              >
                <span>{status === "sending" ? "Се испраќа…" : "Закажи"}</span>
                <span aria-hidden className="ct-btn__arrow">
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M0 4h13M9 1l4 3-4 3" />
                  </svg>
                </span>
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
          </>
        )}
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
