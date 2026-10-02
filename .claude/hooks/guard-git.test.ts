import { describe, expect, it } from "vitest";
// @ts-expect-error plain .mjs hook script, no types
import { check } from "./guard-git.mjs";

describe("guard-git", () => {
  const blocked: [string, string][] = [
    ["git push --force", "feature"],
    ["git push -f origin feature", "feature"],
    ["git push --force-with-lease origin feature", "feature"],
    ["git push origin main", "feature"],
    ["git push origin HEAD:main", "feature"],
    ["git push origin HEAD:refs/heads/main", "feature"],
    ["git push origin +feature:master", "feature"],
    ["git push origin HEAD", "main"],
    ["git push origin HEAD:main", "feature"],
    ["git push", "main"],
    ["git push origin", "main"],
    ["git commit -m x", "main"],
    ["git -C . commit -m x", "master"],
    ["git add . && git commit -m x", "main"],
    ["git reset --hard HEAD~1", "feature"],
  ];
  const allowed: [string, string][] = [
    ["git push -u origin feature", "feature"],
    ["git push", "feature"],
    ["git push origin HEAD", "feature"],
    ["git commit -m x", "feature"],
    ["git status", "main"],
    ["git log --oneline", "main"],
    ["git diff origin/main...HEAD", "feature"],
    ["npm run check", "main"],
    ['git commit -m "mention git push origin main in text"', "feature"],
  ];

  it.each(blocked)("blocks %s on %s", (command, branch) => {
    expect(check(command, branch)).not.toBeNull();
  });
  it.each(allowed)("allows %s on %s", (command, branch) => {
    expect(check(command, branch)).toBeNull();
  });
});
