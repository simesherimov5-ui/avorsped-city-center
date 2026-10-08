"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { formatArea } from "@/lib/format";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { PrimaryFace } from "@/components/ui/Button";
import { RadioGroup } from "./RadioGroup";
import { BookingConfirmation } from "./BookingConfirmation";
import { buildSlots, nextWorkingDays, todayIso } from "./booking-config";
import { sendBooking, type BookingRequest } from "./send-booking";

/** A project the visitor can ask about, with its buildings if it has any. Passed in by the page, from the data. */
export type ProjectOption = { id: string; name: string; buildings: { id: string; name: string }[] };
/** An apartment that can be asked about (available, or the one the visitor came from). */
export type UnitOption = { id: string; buildingId: string; floor: number; number: string; area: number };
export type BookingStart = { projectId?: string; buildingId?: string; unitId?: string };

type StepId = "project" | "building" | "unit" | "prefs" | "when" | "details";
type Field = "name" | "phone";
type Errors = Partial<Record<Field, string>>;

const SLOTS = buildSlots();
/** The «not sure yet» answer to the first question: no project, and the visitor is advised at the consultation. */
const UNDECIDED = "undecided";
const PREFERENCES = ["Гарсоњера", "Еднособен", "Двособен", "Трособен"];
const MESSAGES: Record<Field, string> = {
  name: "Внесете име и презиме.",
  phone: "Внесете телефонски број со најмалку 8 цифри.",
};
const TITLES: Record<StepId, string> = {
  project: "Каде барате?",
  building: "Која зграда?",
  unit: "Дали имате конкретен стан?",
  prefs: "Што барате?",
  when: "Изберете ден и час",
  details: "Ваши податоци",
};

// "Today" in the booking time zone as a string snapshot: the server renders no days (its clock is not the
// visitor's), the browser fills them in on hydration, and a cached page can never show old dates.
const subscribeNever = () => () => {};
const noToday = () => "";

const floorLabel = (floor: number) => (floor === 0 ? "Приземје" : `Кат ${floor}`);

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
 * The guided booking form. It asks one thing at a time: the project, the building (only for a project that has
 * buildings), whether the visitor has a specific apartment in mind (and which), the day and time, then name and phone.
 * An answered step folds into one summary row with «Измени»; changing an answer clears the answers that depended on it.
 */
export function ContactForm({
  projects,
  units,
  start,
  phone: officePhone,
}: {
  projects: ProjectOption[];
  units: UnitOption[];
  /** Set when the visitor arrives from an apartment, building or project page. */
  start?: BookingStart;
  /** The office phone, shown if sending fails. */
  phone: string;
}) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const startUnit = units.find((u) => u.id === start?.unitId);
  const [projectId, setProjectId] = useState(projects.some((p) => p.id === start?.projectId) ? start!.projectId! : "");
  const [buildingId, setBuildingId] = useState(start?.buildingId ?? "");
  const [hasUnit, setHasUnit] = useState<"" | "yes" | "no">(startUnit ? "yes" : "");
  const [floor, setFloor] = useState(startUnit ? String(startUnit.floor) : "");
  const [unitId, setUnitId] = useState(startUnit?.id ?? "");
  // Without a list of apartments for the project the visitor types the number, and confirms it.
  const [unitText, setUnitText] = useState("");
  const [unitTextOk, setUnitTextOk] = useState(false);
  const [undecided, setUndecided] = useState(false);
  // What the undecided visitor is looking for. Optional: the step is a folded row that «Додај» opens, and it never
  // holds up the day and time step.
  const [prefs, setPrefs] = useState<string[]>([]);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [dayIso, setDayIso] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
  const needsBuilding = (project?.buildings.length ?? 0) > 0;
  const building = project?.buildings.find((b) => b.id === buildingId);
  // The apartments the visitor can pick: those of the chosen building. A project with no list gets the text field.
  const pool = needsBuilding && building ? units.filter((u) => u.buildingId === building.id) : [];
  const floors = [...new Set(pool.map((u) => u.floor))].sort((a, b) => a - b);
  const floorUnits = pool.filter((u) => String(u.floor) === floor);
  const unit = pool.find((u) => u.id === unitId);
  const unitLabel = unit
    ? `Стан ${unit.number} · ${floorLabel(unit.floor)}`
    : unitTextOk && unitText.trim()
      ? `Стан ${unitText.trim()}`
      : "";

  // Which steps are answered, and so which are on screen: every step up to the first unanswered one.
  const order: StepId[] = undecided
    ? ["project", "prefs", "when", "details"]
    : ["project", ...(needsBuilding ? (["building"] as const) : []), "unit", "when", "details"];
  const answered: Record<StepId, boolean> = {
    project: Boolean(project) || undecided,
    building: Boolean(building),
    unit: hasUnit === "no" || (hasUnit === "yes" && Boolean(unit || unitTextOk)),
    prefs: true,
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
    if (id === "prefs") return prefs.length ? prefs.join(", ") : "По желба";
    if (id === "building") return building?.name ?? "";
    if (id === "unit") return hasUnit === "no" ? "Не" : unitLabel;
    if (id === "when") return [day?.label, time].filter(Boolean).join(" · ");
    return "";
  };
  const summary = [
    undecided ? "Проект: не е избран" : project?.name,
    undecided && prefs.length ? `Што бара: ${prefs.join(", ")}` : undefined,
    building?.name,
    hasUnit === "yes" ? unitLabel : undefined,
    day?.label,
    time || undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  // ---- answers: each one clears what depended on it
  const clearUnit = () => {
    setFloor("");
    setUnitId("");
    setUnitText("");
    setUnitTextOk(false);
  };
  const pickProject = (id: string) => {
    const next = id === UNDECIDED;
    if (next !== undecided || (!next && id !== projectId)) {
      // a different answer: whatever hung on the old one goes
      setUndecided(next);
      setProjectId(next ? "" : id);
      setBuildingId("");
      setHasUnit("");
      clearUnit();
      setPrefs([]);
      setPrefsOpen(false);
    }
    setEditing(null);
  };
  const togglePref = (value: string) => {
    setPrefs((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]));
  };
  /** «Додај» / «Измени» opens the chips and moves focus into them; «Готово» folds them and returns focus to the row. */
  const setPrefsShown = (open: boolean) => {
    setPrefsOpen(open);
    window.setTimeout(
      () => {
        const wrap = form.current?.querySelector<HTMLElement>('[data-step-wrap="prefs"]');
        wrap?.querySelector<HTMLElement>(open ? "button.ct-tog" : "button.ct-edit")?.focus({ preventScroll: true });
      },
      reduce ? 0 : 340
    );
  };
  const pickBuilding = (id: string) => {
    if (id !== buildingId) {
      setBuildingId(id);
      setHasUnit("");
      clearUnit();
    }
    setEditing(null);
  };
  const pickHasUnit = (value: "yes" | "no") => {
    if (value !== hasUnit) clearUnit();
    setHasUnit(value);
    setEditing(null);
  };
  const pickFloor = (value: string) => {
    if (value !== floor) setUnitId("");
    setFloor(value);
  };
  const pickUnit = (id: string) => {
    setUnitId(id);
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
        step
          .querySelector<HTMLElement>('[role="radio"][tabindex="0"], input, button.ct-go, button.ct-tog')
          ?.focus({ preventScroll: true });
      },
      reduce ? 0 : 340
    );
    return () => window.clearTimeout(timer);
  }, [openId, reduce]);

  const clearError = (field: Field) => setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));

  function reset() {
    setProjectId(projects.some((p) => p.id === start?.projectId) ? start!.projectId! : "");
    setUndecided(false);
    setPrefs([]);
    setPrefsOpen(false);
    setBuildingId(start?.buildingId ?? "");
    setHasUnit(startUnit ? "yes" : "");
    setFloor(startUnit ? String(startUnit.floor) : "");
    setUnitId(startUnit?.id ?? "");
    setUnitText("");
    setUnitTextOk(false);
    setDayIso("");
    setTime("");
    setName("");
    setPhone("");
    setEditing(null);
    setErrors({});
    setStatus("idle");
  }

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = MESSAGES.name;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15 || !/^[+\d\s()/.-]+$/.test(phone.trim())) next.phone = MESSAGES.phone;
    return next;
  }

  /** Moves focus into the first field that is missing and shakes it once. */
  function showFirstError(next: Errors) {
    const first = (["name", "phone"] as Field[]).find((f) => next[f]);
    const field = first && form.current?.querySelector<HTMLElement>(`[data-step="${first}"]`);
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
    if (!day || !time) return;
    if (!undecided && (!project || (needsBuilding && !building) || !answered.unit)) return;
    const request: BookingRequest = {
      project: undecided ? null : project!.name,
      projectId: undecided ? null : project!.id,
      undecided,
      preferences: undecided ? prefs : [],
      building: undecided ? undefined : building?.name,
      buildingId: undecided ? undefined : building?.id,
      unit: !undecided && hasUnit === "yes" ? unitLabel || undefined : undefined,
      unitId: !undecided && hasUnit === "yes" ? unit?.id : undefined,
      date: day.iso,
      dateLabel: day.label,
      time,
      name: name.trim(),
      phone: phone.trim(),
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
  const step = (id: StepId, body: ReactNode, note?: ReactNode) => {
    const index = visible.indexOf(id);
    if (index < 0) return null;
    const number = String(index + 1).padStart(2, "0");
    // «Што барате?» is optional: it opens and closes on its own and is not part of the one-step-at-a-time flow.
    const optional = id === "prefs";
    const isOpen = optional ? prefsOpen : openId === id;
    const isFolded = !isOpen && answered[id];
    const empty = optional && prefs.length === 0;
    const action = optional && empty ? "Додај" : "Измени";
    return (
      <div key={id} className="ct-step-wrap" data-step-wrap={id}>
        <Collapse show={isOpen} reduce={reduce} enter>
          <section data-step={id} className="ct-step" aria-labelledby={`ct-h-${id}`}>
            <div className="ct-step-h bk-label" id={`ct-h-${id}`} role="heading" aria-level={2}>
              <b className="ct-step-n bk-mono">{number}</b>
              <span>{TITLES[id]}</span>
            </div>
            {body}
          </section>
        </Collapse>
        <Collapse show={isFolded} reduce={reduce}>
          <div className="ct-step ct-sumrow">
            <b className="ct-step-n bk-mono">{number}</b>
            <span className="ct-sumrow-label bk-label">{TITLES[id]}</span>
            <span className={empty ? "ct-sumrow-value is-muted" : "ct-sumrow-value"}>{summaryOf(id)}</span>
            <button
              type="button"
              className="ct-edit"
              aria-label={`${action}: ${TITLES[id]}`}
              onClick={() => (optional ? setPrefsShown(true) : setEditing(id))}
            >
              {action}
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

        {undecided &&
          step(
            "prefs",
            <>
              <div role="group" aria-label={TITLES.prefs} data-group="prefs" data-stagger className="ct-chips">
                {PREFERENCES.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={prefs.includes(label)}
                    className="ct-chip ct-tog"
                    style={{ animationDelay: `${i * 40}ms` }}
                    onClick={() => togglePref(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="ct-actions">
                <button type="button" className="ct-chip ct-go" onClick={() => setPrefsShown(false)}>
                  Готово
                </button>
              </div>
            </>
          )}

        {needsBuilding &&
          !undecided &&
          step(
            "building",
            <RadioGroup
              groupId="building"
              label={TITLES.building}
              className="ct-chips"
              itemClassName="ct-chip"
              stagger
              value={buildingId}
              onChange={pickBuilding}
              options={(project?.buildings ?? []).map((b) => ({ value: b.id, label: b.name, content: b.name }))}
            />
          )}

        {!undecided &&
          step(
            "unit",
            <>
              <RadioGroup
                groupId="has-unit"
                label={TITLES.unit}
                className="ct-chips"
                itemClassName="ct-chip"
                stagger
                value={hasUnit}
                onChange={(v) => pickHasUnit(v as "yes" | "no")}
                options={[
                  { value: "yes", label: "Да", content: "Да" },
                  { value: "no", label: "Не", content: "Не" },
                ]}
              />
              <Collapse show={hasUnit === "yes"} reduce={reduce}>
                <div className="ct-sub">
                  {pool.length > 0 ? (
                    <>
                      <div className="ct-sub-label bk-label">Кат</div>
                      <RadioGroup
                        groupId="floor"
                        label="Кат"
                        className="ct-chips"
                        itemClassName="ct-chip"
                        stagger
                        value={floor}
                        onChange={pickFloor}
                        options={floors.map((f) => ({
                          value: String(f),
                          label: floorLabel(f),
                          content: floorLabel(f),
                        }))}
                      />
                      <Collapse show={floorUnits.length > 0} reduce={reduce}>
                        <div className="ct-sub-label bk-label">Стан</div>
                        <RadioGroup
                          groupId="unit"
                          label="Стан"
                          className="ct-chips"
                          itemClassName="ct-chip is-mono"
                          stagger
                          value={unitId}
                          onChange={pickUnit}
                          options={floorUnits.map((u) => ({
                            value: u.id,
                            label: `Стан ${u.number}, ${formatArea(u.area)}`,
                            content: u.number,
                          }))}
                        />
                      </Collapse>
                    </>
                  ) : (
                    <div className="ct-unit-text">
                      <div className="ct-field">
                        <label htmlFor="ct-unit-text" className="bk-label">
                          Број на стан
                        </label>
                        <div className="ct-input">
                          <input
                            id="ct-unit-text"
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            value={unitText}
                            onChange={(e) => {
                              setUnitText(e.target.value);
                              setUnitTextOk(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && unitText.trim()) {
                                e.preventDefault();
                                setUnitTextOk(true);
                                setEditing(null);
                              }
                            }}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="ct-chip ct-go"
                        disabled={!unitText.trim()}
                        onClick={() => {
                          setUnitTextOk(true);
                          setEditing(null);
                        }}
                      >
                        Продолжи
                      </button>
                    </div>
                  )}
                </div>
              </Collapse>
            </>
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
              <div className="ct-field" data-step="name">
                <label htmlFor="ct-name" className="bk-label">
                  Име и презиме
                </label>
                <div className="ct-input">
                  <input
                    id="ct-name"
                    name="name"
                    type="text"
                    autoComplete="name"
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
              <div className="ct-field" data-step="phone">
                <label htmlFor="ct-phone" className="bk-label">
                  Телефон
                </label>
                <div className="ct-input">
                  <input
                    id="ct-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    aria-required="true"
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={describe("phone")}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearError("phone");
                    }}
                  />
                </div>
                {error("phone")}
              </div>
            </div>

            <div className="ct-submit">
              <button
                ref={submitButton}
                type="submit"
                className="btn-primary"
                data-tone="dark"
                disabled={status === "sending"}
                aria-busy={status === "sending"}
              >
                <PrimaryFace>{status === "sending" ? "Се испраќа…" : "Закажи"}</PrimaryFace>
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
