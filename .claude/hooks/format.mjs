// PostToolUse (Edit|Write): format the edited file with the project's Prettier.
// Never blocks. Reports a Prettier failure (for example a syntax error) back to Claude.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const file = input?.tool_input?.file_path;
const root = process.env.CLAUDE_PROJECT_DIR || input?.cwd || process.cwd();
const prettier = join(root, "node_modules", ".bin", process.platform === "win32" ? "prettier.cmd" : "prettier");

if (file && existsSync(file) && existsSync(prettier)) {
  try {
    // --ignore-unknown skips unsupported file types; .prettierignore is respected.
    execFileSync(prettier, ["--ignore-unknown", "--write", file], { cwd: root, stdio: "pipe" });
  } catch (error) {
    const detail = String(error.stderr || error.message)
      .trim()
      .split("\n")
      .slice(0, 8)
      .join("\n");
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: `Prettier could not format ${file}:\n${detail}`,
        },
      })
    );
  }
}
