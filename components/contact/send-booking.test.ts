import { describe, expect, it } from "vitest";
import { bookingEmail, bookingLines, type BookingRequest } from "./send-booking";

const base: BookingRequest = {
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
  phone: "070 000 000",
};

describe("bookingLines", () => {
  it("starts with the area range, then the project, the appointment, the name and the phone", () => {
    expect(bookingLines(base)).toEqual([
      "Површина: 70–100 m²",
      "Проект: City Center",
      "Термин: Пон 12 окт, 10:00",
      "Име: Тест Тестовски",
      "Телефон: 070 000 000",
    ]);
  });

  it("writes the top of the scale as 150+", () => {
    expect(bookingLines({ ...base, areaMin: 105, areaMax: 150 })[0]).toBe("Површина: 105–150+ m²");
  });

  it("says «Не знае – совет» when the visitor does not know the area", () => {
    expect(bookingLines({ ...base, areaMin: null, areaMax: null, areaUnknown: true })[0]).toBe(
      "Површина: Не знае – совет"
    );
  });

  it("says no project was chosen when the visitor is undecided", () => {
    const lines = bookingLines({ ...base, project: null, projectId: null, undecided: true });
    expect(lines[1]).toBe("Проект: не е избран");
  });

  it("carries no building or apartment", () => {
    expect(bookingLines(base).join("\n")).not.toMatch(/Зграда|Стан/);
  });
});

describe("bookingEmail", () => {
  it("puts the area and the project in the subject and the area first in the body", () => {
    const { subject, text } = bookingEmail(base);
    expect(subject).toBe("Нова консултација · 70–100 m² · City Center");
    expect(text.split("\n")[0]).toBe("Површина: 70–100 m²");
  });

  it("keeps the visitor's own words out of the subject", () => {
    expect(bookingEmail({ ...base, name: "Некој Некојовски" }).subject).not.toContain("Некојовски");
  });
});
