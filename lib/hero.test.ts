import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HERO_OVERLAY_MIN_WIDTH, HERO_UNDER_HEADER_PATHS } from "@/lib/hero";
import { projects } from "@/data";

const read = (path: string) => readFileSync(path, "utf8");

describe("the hero breakpoint", () => {
  it("is the same in the shared CSS as in lib/hero.ts", () => {
    const css = read("app/globals.css");
    const block = css.slice(css.indexOf("hero breakpoint"));
    expect(block).toContain(`@media (min-width: ${HERO_OVERLAY_MIN_WIDTH}px)`);
  });

  it("is not repeated in the CSS of a single hero", () => {
    const projects = read("components/projects/projects.css");
    expect(projects).not.toMatch(/min-width:\s*1(10[01])px/);
  });
});

describe("the pages the header floats over", () => {
  it("include every photo-led (diptych) project page", () => {
    for (const p of projects.filter((x) => x.layout === "diptych"))
      expect(HERO_UNDER_HEADER_PATHS).toContain(`/projects/${p.slug}`);
  });
});
