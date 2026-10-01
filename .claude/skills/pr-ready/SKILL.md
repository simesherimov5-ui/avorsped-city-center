---
name: pr-ready
description: Verify the branch, run the reviewer, and open a pull request with a verified / not verified report. Never merges.
disable-model-invocation: true
---

Prepare and open a pull request for the current branch. Never merge.

1. Preconditions: the branch is not `main`, `git status` is clean (commit or stop), and commits are one concern each.
2. Run `npm run check` and `npm run build`. If either fails, report the output and stop.
3. Ask the `reviewer` subagent to review `git diff origin/main...HEAD`. Fix Blockers; list the rest in the PR.
4. Scan the diff and your commit and PR text for `.env*` content, client documents, prices and personal data (`CLAUDE.md`, "Ask first"). If anything matches, stop and report.
5. Update `docs/roadmap.md` if a decision changed or a known gap closed.
6. Push the branch and open the PR with `gh pr create`. Fill in the repository's PR template if `.github/pull_request_template.md` exists. State what you ran and what you could not run.

**Done when:** the PR is open, check and build results are in its description, and nothing was merged.

**Finish with a report:**

- **Verified:** commands and results, the reviewer's findings and what you did about them.
- **Not verified:** anything needing a browser, a deployment or another OS.
- The PR link.
