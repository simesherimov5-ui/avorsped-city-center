import { describe, expect, it } from "vitest";
import { isValidEmail, isValidPhone, sanitizePhone, validateBooking } from "./booking-validate";

const ctx = { projects: [{ id: "city-center", name: "City Center" }], today: "2026-10-09" }; // a Friday
const good = {
  projectId: "city-center",
  undecided: false,
  areaMin: 70,
  areaMax: 100,
  areaUnknown: false,
  date: "2026-10-12", // the Monday after
  time: "10:00",
  name: "  Тест   Тестовски ",
  phone: "070 123 456",
};

describe("sanitizePhone", () => {
  it("keeps only the digits of letters and signs mixed in", () => {
    expect(sanitizePhone("07a0-bc123")).toBe("070123");
  });
  it("allows one leading + and single spaces", () => {
    expect(sanitizePhone("+389 70  123 456")).toBe("+389 70 123 456");
    expect(sanitizePhone("070+123")).toBe("070123");
    expect(sanitizePhone("++389")).toBe("+389");
    expect(sanitizePhone("  070")).toBe("070");
  });
  it("stops at 15 digits", () => {
    expect(sanitizePhone("1234567890123456789")).toBe("123456789012345");
  });
});

describe("isValidPhone", () => {
  it("needs 8 to 15 digits", () => {
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("1234567")).toBe(false);
    expect(isValidPhone("12345678")).toBe(true);
    expect(isValidPhone("+389 70 123 456")).toBe(true);
    expect(isValidPhone("1234567890123456")).toBe(false);
  });
  it("refuses letters", () => {
    expect(isValidPhone("0701234abc")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts an address and refuses what is not one", () => {
    expect(isValidEmail("ime@primer.com")).toBe(true);
    expect(isValidEmail("ime.prezime+kuka@primer.com.mk")).toBe(true);
    for (const bad of [
      "ime",
      "ime@",
      "@primer.com",
      "ime@primer",
      "ime@primer.c",
      "ime @primer.com",
      "ime@@primer.com",
      "ime@pri mer.com",
    ])
      expect(isValidEmail(bad)).toBe(false);
  });
});

describe("validateBooking", () => {
  it("returns a clean copy, with the project name and the day label from the data", () => {
    const r = validateBooking(good, ctx);
    expect(r).toEqual({
      ok: true,
      value: {
        project: "City Center",
        projectId: "city-center",
        undecided: false,
        areaMin: 70,
        areaMax: 100,
        areaUnknown: false,
        date: "2026-10-12",
        dateLabel: "Пон 12 окт",
        time: "10:00",
        name: "Тест Тестовски",
        phone: "070 123 456",
      },
    });
  });

  it("accepts the area as unknown, and an undecided project", () => {
    const r = validateBooking(
      { ...good, projectId: null, undecided: true, areaMin: null, areaMax: null, areaUnknown: true },
      ctx
    );
    expect(r.ok && r.value).toMatchObject({
      project: null,
      undecided: true,
      areaMin: null,
      areaMax: null,
      areaUnknown: true,
    });
  });

  it("holds the area to 55–150 m², whole numbers, from less to more", () => {
    expect(validateBooking({ ...good, areaMin: 50 }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, areaMax: 155 }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, areaMin: 100, areaMax: 100 }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, areaMin: 120, areaMax: 90 }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, areaMin: 70.5 }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, areaMin: "70" }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, areaMin: 55, areaMax: 150 }, ctx).ok).toBe(true);
  });

  it("refuses an unknown project, a weekend, a past day, an odd time, a short name and a bad phone", () => {
    expect(validateBooking({ ...good, projectId: "nope" }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, date: "2026-10-10" }, ctx).ok).toBe(false); // Saturday
    expect(validateBooking({ ...good, date: "2026-10-09" }, ctx).ok).toBe(false); // today
    expect(validateBooking({ ...good, date: "2026-02-30" }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, time: "10:15" }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, name: "A" }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, phone: "123" }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, phone: "07a0123456" }, ctx).ok).toBe(false);
    expect(validateBooking(null, ctx).ok).toBe(false);
  });

  it("treats the e-mail as optional: missing or empty is fine and leaves it out", () => {
    for (const email of [undefined, null, ""]) {
      const r = validateBooking({ ...good, email }, ctx);
      expect(r.ok && "email" in r.value).toBe(false);
    }
  });

  it("keeps a valid e-mail (trimmed) and refuses an invalid one", () => {
    const ok = validateBooking({ ...good, email: "  ime@primer.com " }, ctx);
    expect(ok.ok && ok.value.email).toBe("ime@primer.com");
    expect(validateBooking({ ...good, email: "ime@primer" }, ctx).ok).toBe(false);
    expect(validateBooking({ ...good, email: 12 }, ctx).ok).toBe(false);
  });

  it("ignores a building or an apartment sent along", () => {
    const r = validateBooking({ ...good, building: "Зграда 06", unit: "Стан 21" }, ctx);
    expect(r.ok && Object.keys(r.value)).not.toContain("building");
    expect(r.ok && Object.keys(r.value)).not.toContain("unit");
  });
});
