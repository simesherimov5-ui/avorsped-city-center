import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs hook script, no types
import { isAllowed as bashAllowed } from "./restrict-bash.mjs";
// @ts-expect-error plain .mjs hook script, no types
import { isAllowed as editAllowed } from "./restrict-edit.mjs";

describe("restrict-edit", () => {
  const root = "/repo";
  it("allows only the named file", () => {
    expect(editAllowed("/repo/docs/design-brief.md", "docs/design-brief.md", root)).toBe(true);
    expect(editAllowed("docs/design-brief.md", "docs/design-brief.md", root)).toBe(true);
    expect(editAllowed("/repo/app/page.tsx", "docs/design-brief.md", root)).toBe(false);
    expect(editAllowed("/repo/docs/design-brief.md.bak", "docs/design-brief.md", root)).toBe(false);
    expect(editAllowed("/repo/../other/docs/design-brief.md", "docs/design-brief.md", root)).toBe(false);
  });
});

describe("restrict-bash", () => {
  it.each(["git status", "git diff origin/main...HEAD", "git log --oneline -5", "git show HEAD~1", "git -C . diff"])(
    "allows %s",
    (command) => expect(bashAllowed(command)).toBe(true)
  );
  it.each([
    "git push",
    "git status && rm -rf x",
    "git diff > out.txt",
    "git log | sh",
    "git status; git push",
    "cat .env",
    "git diff $(whoami)",
    "npm run check",
  ])("blocks %s", (command) => expect(bashAllowed(command)).toBe(false));
});
