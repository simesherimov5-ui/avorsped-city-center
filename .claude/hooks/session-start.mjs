// SessionStart hook (Node, so it also runs on Windows).
// Claude Code on the web: install dependencies when package-lock.json changed (idempotent).
// Local: install nothing; if node_modules is missing, tell Claude to run `npm ci` (stdout becomes context).
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const modules = join(root, "node_modules");
const stamp = join(modules, ".lock-stamp");
const current = createHash("sha256")
  .update(readFileSync(join(root, "package-lock.json")))
  .digest("hex");

const upToDate = existsSync(modules) && existsSync(stamp) && readFileSync(stamp, "utf8").trim() === current;
if (upToDate) process.exit(0);

if (process.env.CLAUDE_CODE_REMOTE === "true") {
  execSync("npm ci --no-audit --no-fund", { cwd: root, stdio: ["ignore", "ignore", "inherit"] });
  writeFileSync(stamp, current);
} else if (!existsSync(modules)) {
  console.log("node_modules is missing. Run `npm ci` before lint, typecheck, tests or build.");
}
