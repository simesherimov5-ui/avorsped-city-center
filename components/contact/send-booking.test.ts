import { describe, expect, it } from "vitest";
import { bookingLines, type BookingRequest } from "./send-booking";

const base: BookingRequest = {
  project: null,
  projectId: null,
  undecided: true,
  preferences: ["Двособен", "Трособен"],
  date: "2026-10-12",
  dateLabel: "Пон 12 окт",
  time: "10:00",
  name: "Тест Тестовски",
  phone: "070 000 000",
};

describe("bookingLines", () => {
  it("says no project was chosen and lists what an undecided visitor is looking for", () => {
    const lines = bookingLines(base);
    expect(lines[0]).toBe("Проект: не е избран");
    expect(lines[1]).toBe("Што бара: Двособен, Трособен");
  });

  it("says nothing was named when the visitor skipped the question", () => {
    expect(bookingLines({ ...base, preferences: [] })[1]).toBe("Што бара: не е наведено");
  });

  it("names the project and building when one was chosen", () => {
    const lines = bookingLines({
      ...base,
      project: "City Center",
      projectId: "city-center",
      undecided: false,
      preferences: [],
      building: "Зграда 06",
    });
    expect(lines.slice(0, 2)).toEqual(["Проект: City Center", "Зграда: Зграда 06"]);
  });

  it("says the building was not chosen when the visitor does not know which one", () => {
    const lines = bookingLines({
      ...base,
      project: "City Center",
      projectId: "city-center",
      undecided: false,
      preferences: [],
      building: null,
      buildingId: null,
      buildingUnknown: true,
    });
    expect(lines.slice(0, 2)).toEqual(["Проект: City Center", "Зграда: не е избрана"]);
  });
});
