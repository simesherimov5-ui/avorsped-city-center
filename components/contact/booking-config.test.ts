import { describe, expect, it } from "vitest";
import { buildSlots, nextWorkingDays, todayIso } from "./booking-config";

const labels = (today: string, closed: string[] = []) => nextWorkingDays(today, closed).map((d) => d.label);

describe("buildSlots", () => {
  it("gives 15 slots from 09:00 to 16:00, every 30 minutes, 16:00 included", () => {
    const slots = buildSlots();
    expect(slots).toHaveLength(15);
    expect(slots[0]).toBe("09:00");
    expect(slots[1]).toBe("09:30");
    expect(slots[14]).toBe("16:00");
  });

  it("follows the config", () => {
    expect(buildSlots({ start: "10:00", end: "11:00", stepMinutes: 20 })).toEqual(["10:00", "10:20", "10:40", "11:00"]);
  });
});

describe("nextWorkingDays", () => {
  it("opened on a Wednesday: Thu, Fri, then the next Mon, Tue, Wed", () => {
    // 2026-10-07 is a Wednesday
    expect(labels("2026-10-07")).toEqual(["Чет 08 окт", "Пет 09 окт", "Пон 12 окт", "Вто 13 окт", "Сре 14 окт"]);
  });

  it("opened on a Friday: starts on Monday", () => {
    expect(labels("2026-10-09")).toEqual(["Пон 12 окт", "Вто 13 окт", "Сре 14 окт", "Чет 15 окт", "Пет 16 окт"]);
  });

  it("opened on a Saturday or Sunday: starts on Monday", () => {
    expect(labels("2026-10-10")[0]).toBe("Пон 12 окт");
    expect(labels("2026-10-11")[0]).toBe("Пон 12 окт");
  });

  it("never offers a weekend day", () => {
    for (let day = 1; day <= 28; day++) {
      const today = `2026-10-${String(day).padStart(2, "0")}`;
      for (const d of nextWorkingDays(today)) expect(["Сре", "Чет", "Пет", "Пон", "Вто"]).toContain(d.weekday);
    }
  });

  it("skips closed dates", () => {
    expect(labels("2026-10-07", ["2026-10-08"])).toEqual([
      "Пет 09 окт",
      "Пон 12 окт",
      "Вто 13 окт",
      "Сре 14 окт",
      "Чет 15 окт",
    ]);
  });

  it("crosses a month and a year", () => {
    // 2026-12-30 is a Wednesday
    expect(labels("2026-12-30")).toEqual(["Чет 31 дек", "Пет 01 јан", "Пон 04 јан", "Вто 05 јан", "Сре 06 јан"]);
  });

  it("returns the ISO date of each day", () => {
    expect(nextWorkingDays("2026-10-07")[0].iso).toBe("2026-10-08");
  });
});

describe("todayIso", () => {
  it("uses the Skopje date, not the device's", () => {
    // 23:30 UTC on 7 Oct is already 8 Oct in Skopje (UTC+2 in summer)
    expect(todayIso(new Date("2026-10-07T23:30:00Z"))).toBe("2026-10-08");
    expect(todayIso(new Date("2026-10-07T12:00:00Z"))).toBe("2026-10-07");
  });
});
