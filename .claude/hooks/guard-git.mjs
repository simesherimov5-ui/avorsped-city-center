// PreToolUse hook (Bash and PowerShell): block git commands that break the workflow in CLAUDE.md.
// Blocks: force pushes, pushes that target main/master (explicitly, or implicitly from main),
// `git reset --hard`, and commits made while on main/master. Exit code 2 blocks the call.
// The permission deny rules cover the plain forms; this also catches the forms patterns miss
// (no refspec, HEAD:refs/heads/main, the PowerShell tool).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PROTECTED = /^(main|master)$/;

function split(command) {
  return command
    .split(/&&|\|\||;|\||\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function tokens(segment) {
  return (segment.match(/"[^"]*"|'[^']*'|\S+/g) || []).map((t) => t.replace(/^["']|["']$/g, ""));
}

// Returns { sub, args } for a git invocation, skipping global options such as -C <dir> and -c k=v.
function parseGit(segment) {
  const t = tokens(segment);
  const at = t.findIndex((x) => x === "git" || /[\\/]git(\.exe)?$/.test(x));
  if (at === -1) return null;
  let i = at + 1;
  while (i < t.length && t[i].startsWith("-")) i += t[i] === "-C" || t[i] === "-c" ? 2 : 1;
  return { sub: t[i], args: t.slice(i + 1) };
}

function targetsProtected(refspec) {
  const ref = refspec.replace(/^\+/, "");
  const dst = ref.includes(":") ? ref.split(":").pop() : ref;
  return PROTECTED.test(dst.replace(/^refs\/heads\//, ""));
}

/** @returns {string | null} a reason to block, or null to allow */
export function check(command, currentBranch) {
  for (const segment of split(command)) {
    const git = parseGit(segment);
    if (!git) continue;
    const { sub, args } = git;
    const onProtected = PROTECTED.test(currentBranch || "");

    if (sub === "reset" && args.includes("--hard")) return "git reset --hard is blocked.";
    if (sub === "commit" && onProtected) return `Commits on ${currentBranch} are blocked: work on a branch.`;
    if (sub !== "push") continue;

    if (args.some((a) => a === "-f" || a === "--force" || a.startsWith("--force-with-lease") || a === "--mirror")) {
      return "Force pushes are blocked.";
    }
    const positional = args.filter((a) => !a.startsWith("-"));
    // `HEAD` pushes the current branch, so resolve it before checking the target.
    const refspecs = positional.slice(1).map((r) => r.replace(/^(\+?)HEAD(?=:|$)/, `$1${currentBranch || "HEAD"}`));
    if (refspecs.some(targetsProtected)) return "Pushing to main/master is blocked: open a pull request.";
    if (refspecs.length === 0 && onProtected) return `Pushing ${currentBranch} is blocked: open a pull request.`;
  }
  return null;
}

function branchOf(cwd) {
  try {
    return execFileSync("git", ["branch", "--show-current"], { cwd, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const input = JSON.parse(readFileSync(0, "utf8") || "{}");
  const command = input?.tool_input?.command;
  if (typeof command === "string" && /\bgit\b/.test(command)) {
    const reason = check(command, branchOf(input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd()));
    if (reason) {
      console.error(`${reason} See CLAUDE.md, "Workflow".`);
      process.exit(2);
    }
  }
}
