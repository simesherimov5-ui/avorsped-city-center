// Stop hook: when code changed, run `npm run check` and block the stop (exit 2) if it fails,
// so Claude sees the errors and fixes them. The stderr tail is what Claude reads.
//
// Loop guard: after MAX_BLOCKS consecutive failures it lets Claude stop and warns the user,
// so a check Claude cannot fix never traps the session. State is keyed by session id.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MAX_BLOCKS = 3;

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
if (input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const sh = (cmd) => execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

let changed;
try {
  changed = sh("git status --porcelain").split("\n").filter(Boolean);
} catch {
  process.exit(0); // not a git checkout: nothing to compare against
}
// Nothing changed, or only Markdown changed: skip.
if (changed.length === 0 || changed.every((line) => line.trim().endsWith(".md"))) process.exit(0);

if (!existsSync(join(root, "node_modules"))) {
  console.log(JSON.stringify({ systemMessage: "verify hook skipped: node_modules missing (run npm ci)." }));
  process.exit(0);
}

const stateFile = join(tmpdir(), `claude-verify-${String(input.session_id || "local").replace(/\W/g, "_")}.json`);
const readBlocks = () => {
  try {
    return JSON.parse(readFileSync(stateFile, "utf8")).blocks || 0;
  } catch {
    return 0;
  }
};

try {
  sh("npm run -s check");
  rmSync(stateFile, { force: true });
  process.exit(0);
} catch (error) {
  const blocks = readBlocks() + 1;
  const output = `${error.stdout || ""}${error.stderr || ""}`.trim().split("\n").slice(-40).join("\n");
  if (blocks > MAX_BLOCKS) {
    rmSync(stateFile, { force: true });
    console.log(
      JSON.stringify({
        systemMessage: `npm run check still fails after ${MAX_BLOCKS} attempts; stopping anyway.\n${output}`,
      })
    );
    process.exit(0);
  }
  writeFileSync(stateFile, JSON.stringify({ blocks }));
  console.error(`npm run check failed (attempt ${blocks}/${MAX_BLOCKS}). Fix these before stopping:\n${output}`);
  process.exit(2);
}
