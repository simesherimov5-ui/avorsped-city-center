// PreToolUse hook for the read-only reviewer subagent: allow only `git status|diff|log|show`.
// Pipes, redirects and command chaining are rejected so the allowlist cannot be sidestepped.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ALLOWED = /^git(\s+-C\s+\S+)?\s+(status|diff|log|show)(\s|$)/;

/** @returns {boolean} */
export function isAllowed(command) {
  const text = command.trim();
  if (/[;&|<>`\r\n]|\$\(/.test(text)) return false;
  if (/(^|\s)--output(=|\s|$)/.test(text)) return false; // `git diff --output=file` writes a file
  return ALLOWED.test(text);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const input = JSON.parse(readFileSync(0, "utf8") || "{}");
  const command = input?.tool_input?.command;
  if (typeof command === "string" && !isAllowed(command)) {
    console.error("The reviewer may only run git status, git diff, git log and git show.");
    process.exit(2);
  }
}
