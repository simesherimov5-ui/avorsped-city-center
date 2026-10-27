import { describe, expect, it } from "vitest";
import { companyStats, companyTimeline } from "@/data";

describe("the company-level texts of За нас", () => {
  it("count the buildings being built without the projects known only by name", () => {
    // City Center's six, Станбена куќа 1, Дојрански Рај and Радовиш Twins (no building list yet: counted as one)
    expect(companyStats.find((s) => s.label === "Згради во изградба")?.value).toBe("9");
  });

  it("name the projects being built, the Macedonian way, without the projects known only by name", () => {
    expect(companyTimeline.find((m) => m.year === "2026")?.text).toBe(
      "Во изградба: City Center, Станбена куќа 1, Дојрански Рај и Радовиш Twins."
    );
  });
});
