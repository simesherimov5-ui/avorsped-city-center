import { describe, expect, it } from "vitest";
import { projectsOnSale } from "@/data";
import { startProjectId } from "@/lib/contact-start";

describe("startProjectId (the Контакт form's ?project=)", () => {
  const listed = projectsOnSale().map(({ project }) => project.id);

  it("pre-selects every project the form lists, by its address", () => {
    for (const id of listed) expect(startProjectId(id, listed)).toBe(id);
    expect(startProjectId("radovish-twins", listed)).toBe("radovish-twins");
  });

  it("still pre-selects Станбена куќа 1 from its old address", () => {
    expect(startProjectId("vista-heights", listed)).toBe("stanbena-kukja");
  });

  it("pre-selects nothing for a finished project or an unknown value", () => {
    expect(startProjectId("gtc-global", listed)).toBeUndefined();
    expect(startProjectId("no-such-project", listed)).toBeUndefined();
    expect(startProjectId(undefined, listed)).toBeUndefined();
  });
});
