import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HERO_OVERLAY_MIN_WIDTH, HERO_UNDER_HEADER_PATHS, NAV_HEIGHTS, OPENING_WIDE_QUERY } from "@/lib/hero";
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

describe("the photo-led opening", () => {
  it("switches at the same screen shape in the CSS as in lib/hero.ts", () => {
    const css = read("app/globals.css");
    const block = css.slice(css.indexOf("opening shape"));
    expect(block).toContain(`@media ${OPENING_WIDE_QUERY}`);
  });

  it("works its photo's width out from the header heights of the CSS", () => {
    const css = read("app/globals.css");
    for (const [min, height] of NAV_HEIGHTS) {
      const rule = `--nav-h: ${height}px;`;
      if (min === 0) expect(css.slice(css.indexOf(":root"))).toContain(rule);
      else expect(css.slice(css.indexOf(`@media (min-width: ${min}px)`))).toMatch(new RegExp(`^[^}]*${rule}`));
    }
  });
});

describe("the pages the header floats over", () => {
  it("include every photo-led project page", () => {
    for (const p of projects.filter((x) => x.layout === "photo-led"))
      expect(HERO_UNDER_HEADER_PATHS).toContain(`/projects/${p.slug}`);
  });
});
