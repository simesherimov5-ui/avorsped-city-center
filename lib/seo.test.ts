import { describe, expect, it } from "vitest";
import { pageMetadata, truncate } from "@/lib/seo";
import { availableWord, floorsText, unitsText } from "@/lib/plural";

describe("truncate", () => {
  it("leaves a short text alone", () => {
    expect(truncate("Кратка порака.")).toBe("Кратка порака.");
  });

  it("cuts a long text at a word and adds an ellipsis", () => {
    const long = "збор ".repeat(60);
    const out = truncate(long, 40);
    expect(out.length).toBeLessThanOrEqual(40);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\s…$/);
  });
});

describe("pageMetadata", () => {
  const m = pageMetadata({ title: "Проекти", description: "Опис.", path: "/projects" });

  it("gives the page its own canonical link and matching social tags", () => {
    expect(m.alternates?.canonical).toBe("/projects");
    expect(m.openGraph).toMatchObject({ title: "Проекти | Јавор Шпед", description: "Опис.", url: "/projects" });
    expect(m.twitter).toMatchObject({ card: "summary_large_image", title: "Проекти | Јавор Шпед" });
  });

  it("can keep a page out of search results", () => {
    expect(pageMetadata({ title: "A", description: "B", path: "/a", noindex: true }).robots).toEqual({
      index: false,
      follow: true,
    });
  });
});

describe("plural helpers", () => {
  it("use the singular form only for 1", () => {
    expect(availableWord(1)).toBe("достапен");
    expect(availableWord(0)).toBe("достапни");
    expect(availableWord(2)).toBe("достапни");
    expect(unitsText(1)).toBe("1 стан");
    expect(unitsText(5)).toBe("5 станови");
    expect(floorsText(1)).toBe("1 кат");
    expect(floorsText(6)).toBe("6 ката");
  });
});
