// PreToolUse hook for skills that may write exactly one file (/design-proposal, /ux-audit).
// Usage in a skill's frontmatter: node restrict-edit.mjs <allowed path relative to the project>.
// Blocks the Edit and Write tools on any other path (exit code 2). It does not cover NotebookEdit
// or shell redirects; the skill text and the reviewer cover those.
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** @returns {boolean} true when `file` is the allowed file */
export function isAllowed(file, allowed, root) {
  const rel = relative(resolve(root), resolve(root, file)).replaceAll("\\", "/");
  return rel === allowed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const allowed = process.argv[2];
  const input = JSON.parse(readFileSync(0, "utf8") || "{}");
  const file = input?.tool_input?.file_path;
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  if (allowed && typeof file === "string" && !isAllowed(file, allowed, root)) {
    console.error(`This skill may only edit ${allowed}. Blocked: ${file}`);
    process.exit(2);
  }
}
