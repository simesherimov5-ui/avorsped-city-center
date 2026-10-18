"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { DUR, gsap, prefersReducedMotion } from "@/lib/gsap";
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
export type UnitOption = {
  id: string;
  projectId: string;
  buildingId?: string;
  floor: number;
  /** The floor's name as its building's data calls it ("Кат 2", "Поткровје"). */
  floorLabel: string;
  number: string;
  area: number;
  areaDecimals?: number;
};
export type BookingStart = { projectId?: string; buildingId?: string; unitId?: string };

type StepId = "project" | "building" | "unit" | "prefs" | "when" | "details";
type Field = "name" | "phone";
type Errors = Partial<Record<Field, string>>;
/** What the step on screen is doing: waiting for an answer, showing the pick, or leaving. */
type Phase = "idle" | "picking" | "leaving";

const SLOTS = buildSlots();
/** The «not sure yet» answer to the first question: no project, and the visitor is advised at the consultation. */
const UNDECIDED = "undecided";
/** The same for the building: «Не знам која зграда» skips the apartment question. */
const UNKNOWN_BUILDING = "unknown-building";
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

/**
 * The step motion (ms). A pick fills the chosen option with foil (450ms) while the others fade; PICK_HOLD after the
 * pick the step leaves (LEAVE), then the next one comes in (its title, then its options; the delays are in RadioGroup
 * and contact.css).
 */
const PICK_HOLD = 550;
const LEAVE = 300;
/** Text fields and the send button of the last step come in 220ms apart, after the title. */
const FIELD_GAP = 220;

// "Today" in the booking time zone as a string snapshot: the server renders no days (its clock is not the
// visitor's), the browser fills them in on hydration, and a cached page can never show old dates.
const subscribeNever = () => () => {};
const noToday = () => "";

const floorName = (floor: number, units: UnitOption[]) =>
  units.find((u) => u.floor === floor)?.floorLabel ?? (floor === 0 ? "Приземје" : `Кат ${floor}`);

/** Slides a field 6px each way once, gently, to point at what is missing. */
function shake(el: Element | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { x: 0 },
    { keyframes: [{ x: -6 }, { x: 6 }, { x: -4 }, { x: 4 }, { x: 0 }], duration: DUR.base, ease: "power1.inOut" }
  );
}

/** The entrance delay of the nth field of the last step, as a style. */
const fieldIn = (n: number) => ({ animationDelay: `${100 + n * FIELD_GAP}ms` }) as CSSProperties;

/**
 * The guided booking form. It asks one thing at a time, and only the current question is on screen: the project, the
 * building (only for a project that has buildings), whether the visitor has a specific apartment in mind (and which),
 * the day and time, then name and phone. A pick fills the option with foil, the step leaves and the next one comes in;
 * «← Назад» goes back one step and clears that step's answer. A thin gold line along the top of the panel shows how far
 * along the visitor is (the path is shorter for «Сè уште не знам»). With reduced motion the steps change at once.
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
  const [buildingUnknown, setBuildingUnknown] = useState(false);
  const [hasUnit, setHasUnit] = useState<"" | "yes" | "no">(startUnit ? "yes" : "");
  const [floor, setFloor] = useState(startUnit ? String(startUnit.floor) : "");
  const [unitId, setUnitId] = useState(startUnit?.id ?? "");
  // Without a list of apartments for the project the visitor types the number, and confirms it.
  const [unitText, setUnitText] = useState("");
  const [unitTextOk, setUnitTextOk] = useState(false);
  const [undecided, setUndecided] = useState(false);
  // What the undecided visitor is looking for. Optional: «Готово» moves on with or without a choice.
  const [prefs, setPrefs] = useState<string[]>([]);
  const [prefsDone, setPrefsDone] = useState(false);
  const [dayIso, setDayIso] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
  const pool = !project
    ? []
    : needsBuilding
      ? building
        ? units.filter((u) => u.buildingId === building.id)
        : []
      : units.filter((u) => u.projectId === project.id);
  const floors = [...new Set(pool.map((u) => u.floor))].sort((a, b) => a - b);
  const floorUnits = pool.filter((u) => String(u.floor) === floor);
  const unit = pool.find((u) => u.id === unitId);
  const unitLabel = unit
    ? `Стан ${unit.number} · ${unit.floorLabel}`
    : unitTextOk && unitText.trim()
      ? `Стан ${unitText.trim()}`
      : "";

  // The path through the questions for the answers given so far.
  const order: StepId[] = undecided
    ? ["project", "prefs", "when", "details"]
    : [
        "project",
        ...(needsBuilding ? (["building"] as const) : []),
        ...(buildingUnknown ? [] : (["unit"] as const)),
        "when",
        "details",
      ];
  const answered: Record<StepId, boolean> = {
    project: Boolean(project) || undecided,
    building: Boolean(building) || buildingUnknown,
    unit: hasUnit === "no" || (hasUnit === "yes" && Boolean(unit || unitTextOk)),
    prefs: prefsDone,
    when: Boolean(day && time),
    details: false,
  };

  // The one step on screen: a step, or "the step after" one (resolved on the path as it is once the answer is in). It
  // starts at the first unanswered step (a visitor who came from an apartment page starts further along); `visit` makes
  // a step that is shown again replay its entrance.
  const [position, setPosition] = useState<{ step: StepId; after: boolean }>(() => ({
    step: order.find((id) => !answered[id]) ?? "details",
    after: false,
  }));
  const current: StepId = position.after
    ? (order[order.indexOf(position.step) + 1] ?? "details")
    : order.includes(position.step)
      ? position.step
      : "project";
  const [visit, setVisit] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const busy = phase !== "idle";
  const index = Math.max(0, order.indexOf(current));

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (ms: number, fn: () => void) => {
    if (ms <= 0) return fn();
    timers.current.push(window.setTimeout(fn, ms));
  };

  /** The step on screen leaves (after `hold`, unless reduced motion), then `next` comes in. */
  const goTo = (next: { step: StepId; after: boolean }, hold: number) => {
    later(reduce ? 0 : hold, () => {
      setPhase("leaving");
      later(reduce ? 0 : LEAVE, () => {
        setPosition(next);
        setVisit((v) => v + 1);
        setPhase("idle");
      });
    });
  };

  /** The current step is answered: show the pick, then move on to the next step of the path. */
  const finish = (from: StepId) => {
    setPhase("picking");
    goTo({ step: from, after: true }, PICK_HOLD);
  };

  const summary = [
    undecided ? "Проект: не е избран" : project?.name,
    undecided && prefs.length ? `Што бара: ${prefs.join(", ")}` : undefined,
    buildingUnknown ? "Зграда: не е избрана" : building?.name,
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
  const clearStep = (id: StepId) => {
    if (id === "project") {
      setUndecided(false);
      setProjectId("");
      setBuildingId("");
      setBuildingUnknown(false);
      setHasUnit("");
      clearUnit();
      setPrefs([]);
      setPrefsDone(false);
    } else if (id === "building") {
      setBuildingId("");
      setBuildingUnknown(false);
      setHasUnit("");
      clearUnit();
    } else if (id === "unit") {
      setHasUnit("");
      clearUnit();
    } else if (id === "prefs") {
      setPrefs([]);
      setPrefsDone(false);
    } else if (id === "when") {
      setDayIso("");
      setTime("");
    }
  };
  const pickProject = (id: string) => {
    if (busy) return;
    const next = id === UNDECIDED;
    if (next !== undecided || (!next && id !== projectId)) {
      // a different answer: whatever hung on the old one goes
      setUndecided(next);
      setProjectId(next ? "" : id);
      setBuildingId("");
      setBuildingUnknown(false);
      setHasUnit("");
      clearUnit();
      setPrefs([]);
      setPrefsDone(false);
    }
    finish("project");
  };
  const togglePref = (value: string) => {
    if (busy) return;
    setPrefs((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]));
  };
  const donePrefs = () => {
    if (busy) return;
    setPrefsDone(true);
    finish("prefs");
  };
  const pickBuilding = (id: string) => {
    if (busy) return;
    const unknown = id === UNKNOWN_BUILDING;
    if (unknown !== buildingUnknown || (!unknown && id !== buildingId)) {
      setBuildingUnknown(unknown);
      setBuildingId(unknown ? "" : id);
      setHasUnit("");
      clearUnit();
    }
    finish("building");
  };
  const pickHasUnit = (value: "yes" | "no") => {
    if (busy) return;
    if (value !== hasUnit) clearUnit();
    setHasUnit(value);
    // «Не» answers the question; «Да» opens the floor and apartment choice inside the same step
    if (value === "no") finish("unit");
  };
  const pickFloor = (value: string) => {
    if (busy) return;
    if (value !== floor) setUnitId("");
    setFloor(value);
  };
  const pickUnit = (id: string) => {
    if (busy) return;
    setUnitId(id);
    finish("unit");
  };
  const confirmUnitText = () => {
    if (busy || !unitText.trim()) return;
    setUnitTextOk(true);
    finish("unit");
  };
  // The day and the time: the step ends once both are picked; the day can still be changed before the time.
  const pickDay = (iso: string) => {
    if (busy) return;
    setDayIso(iso);
    if (iso !== dayIso) setTime("");
  };
  const pickTime = (value: string) => {
    if (busy || !dayIso) return;
    setTime(value);
    finish("when");
  };

  /** «← Назад»: the step leaves, the one before comes in again with its answer cleared. */
  const back = () => {
    if (busy || index === 0) return;
    const previous = order[index - 1];
    goTo({ step: previous, after: false }, 0);
    later(reduce ? 0 : LEAVE, () => clearStep(previous));
  };

  // ---- a step that has just come in: keep it in view (below the header) and move focus to its first option
  const seen = useRef(visit);
  useEffect(() => {
    if (seen.current === visit) return; // the first showing: nothing to move
    seen.current = visit;
    const step = form.current?.querySelector<HTMLElement>("[data-step]");
    if (!step) return;
    const header = document.querySelector("header");
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const rect = step.getBoundingClientRect();
    if (rect.top < headerH + 16) {
      const y = rect.top + window.scrollY - headerH - 24;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { duration: reduce ? 0 : DUR.slow, immediate: reduce });
      else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    }
    step
      .querySelector<HTMLElement>('[role="radio"][tabindex="0"], button.ct-tog, input')
      ?.focus({ preventScroll: true });
  }, [visit, reduce]);

  const clearError = (field: Field) => setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));

  function reset() {
    setProjectId(projects.some((p) => p.id === start?.projectId) ? start!.projectId! : "");
    setUndecided(false);
    setPrefs([]);
    setPrefsDone(false);
    setBuildingId(start?.buildingId ?? "");
    setBuildingUnknown(false);
    setHasUnit(startUnit ? "yes" : "");
    setFloor(startUnit ? String(startUnit.floor) : "");
    setUnitId(startUnit?.id ?? "");
    setUnitText("");
    setUnitTextOk(false);
    setDayIso("");
    setTime("");
    setName("");
    setPhone("");
    setErrors({});
    setStatus("idle");
    setPosition({ step: "project", after: false });
    setVisit((v) => v + 1);
    setPhase("idle");
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
    const field = first && form.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    if (!first || !field) return;
    field.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
    const header = document.querySelector("header");
    const y =
      field.getBoundingClientRect().top + window.scrollY - (header ? header.getBoundingClientRect().height : 0) - 120;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: reduce ? 0 : DUR.slow, immediate: reduce });
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
    if (!undecided && (!project || !answered.building || (!buildingUnknown && !answered.unit))) return;
    const request: BookingRequest = {
      project: undecided ? null : project!.name,
      projectId: undecided ? null : project!.id,
      undecided,
      preferences: undecided ? prefs : [],
      building: undecided ? undefined : buildingUnknown ? null : building?.name,
      buildingId: undecided ? undefined : buildingUnknown ? null : building?.id,
      buildingUnknown: !undecided && buildingUnknown,
      unit: !undecided && !buildingUnknown && hasUnit === "yes" ? unitLabel || undefined : undefined,
      unitId: !undecided && !buildingUnknown && hasUnit === "yes" ? unit?.id : undefined,
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

  /** The body of the step on screen. */
  const body = (id: StepId): ReactNode => {
    if (id === "project")
      return (
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
        />
      );
    if (id === "prefs")
      return (
        <>
          <p className="ct-note ct-enter" style={fieldIn(0)}>
            Нема проблем – на консултацијата заедно ќе ги разгледаме сите проекти.
          </p>
          <div role="group" aria-label={TITLES.prefs} data-group="prefs" data-stagger className="ct-chips">
            {PREFERENCES.map((label, i) => (
              <button
                key={label}
                type="button"
                aria-pressed={prefs.includes(label)}
                className="ct-chip ct-tog"
                style={{ animationDelay: `${100 + i * 350}ms` }}
                onClick={() => togglePref(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ct-actions ct-enter" style={{ animationDelay: `${100 + PREFERENCES.length * 350}ms` }}>
            <button type="button" className="ct-chip ct-go" onClick={donePrefs}>
              Готово
            </button>
          </div>
        </>
      );
    if (id === "building")
      return (
        <RadioGroup
          groupId="building"
          label={TITLES.building}
          className="ct-chips"
          itemClassName="ct-chip"
          stagger
          value={buildingUnknown ? UNKNOWN_BUILDING : buildingId}
          onChange={pickBuilding}
          options={[
            ...(project?.buildings ?? []).map((b) => ({ value: b.id, label: b.name, content: b.name })),
            {
              value: UNKNOWN_BUILDING,
              label: "Не знам која зграда",
              content: "Не знам која зграда",
              className: "is-secondary",
            },
          ]}
        />
      );
    if (id === "unit")
      return (
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
          {hasUnit === "yes" && (
            <div className="ct-sub">
              {pool.length > 0 ? (
                <>
                  <div className="ct-sub-label bk-label ct-enter">Кат</div>
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
                      label: floorName(f, pool),
                      content: floorName(f, pool),
                    }))}
                  />
                  {floorUnits.length > 0 && (
                    <>
                      <div className="ct-sub-label bk-label ct-enter">Стан</div>
                      <RadioGroup
                        key={floor}
                        groupId="unit"
                        label="Стан"
                        className="ct-chips"
                        itemClassName="ct-chip is-mono"
                        stagger
                        enterStart={150}
                        enterGap={30}
                        value={unitId}
                        onChange={pickUnit}
                        options={floorUnits.map((u) => ({
                          value: u.id,
                          label: `Стан ${u.number}, ${formatArea(u.area, u.areaDecimals)}`,
                          content: u.number,
                        }))}
                      />
                    </>
                  )}
                </>
              ) : (
                <div className="ct-unit-text ct-enter">
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
                            confirmUnitText();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <button type="button" className="ct-chip ct-go" disabled={!unitText.trim()} onClick={confirmUnitText}>
                    Продолжи
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      );
    if (id === "when")
      return (
        <>
          <div className="ct-days-box">
            {days.length > 0 && (
              <RadioGroup
                groupId="day"
                label="Ден"
                className="ct-days"
                itemClassName="ct-day"
                stagger
                enterStart={150}
                enterGap={30}
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
          {day && (
            <RadioGroup
              groupId="time"
              label="Час"
              className="ct-slots"
              itemClassName="ct-chip is-mono"
              stagger
              enterStart={150}
              enterGap={30}
              value={time}
              onChange={pickTime}
              options={SLOTS.map((s) => ({ value: s, label: s, content: s }))}
            />
          )}
        </>
      );
    return (
      <>
        <div className="ct-fields">
          <div className="ct-field ct-enter" data-field="name" style={fieldIn(0)}>
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
          <div className="ct-field ct-enter" data-field="phone" style={fieldIn(1)}>
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

        <div className="ct-submit ct-enter" style={fieldIn(2)}>
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
    );
  };

  // How far along: the share of the path's questions already behind the visitor (all of it once sent).
  const progress = confirmation.open ? 1 : index / order.length;

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

        <div className="ct-stage">
          <section
            key={`${current}-${visit}`}
            data-step={current}
            className={
              phase === "picking" ? "ct-step is-picking" : phase === "leaving" ? "ct-step is-leaving" : "ct-step"
            }
            aria-labelledby={`ct-h-${current}`}
          >
            <div className="ct-step-h">
              <div className="bk-label ct-step-t" id={`ct-h-${current}`} role="heading" aria-level={2}>
                <b className="ct-step-n bk-mono">{String(index + 1).padStart(2, "0")}</b>
                <span>{TITLES[current]}</span>
              </div>
              {index > 0 && (
                <button type="button" className="ct-back" onClick={back}>
                  <span aria-hidden>←</span>Назад
                </button>
              )}
            </div>
            {body(current)}
          </section>
        </div>
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
