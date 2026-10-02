---
name: dependency-update
description: Update one dependency by one major version, check it, and stop on the first failure.
disable-model-invocation: true
argument-hint: "[package; default: pick from npm outdated]"
arguments: [package]
---

Update **$package** (if empty, choose from `npm outdated` and ask) by **one major version**. Changing `package.json` and `package-lock.json` is "Ask first" in `CLAUDE.md`, so plan before you install.

1. Check the start: `git status` is clean, the branch is not `main`, and `npm run check` passes. If not, report and stop.
2. Run `npm outdated` and `npm view <package> versions`. Pick the next major, not the latest. Linked sets move together: `next` with `eslint-config-next` (exact pins in `package.json`); `react` with `react-dom` and `@types/react`. One set per run.
3. **Plan, then stop.** State the package, current and target version, the files that change, and what you will read. Wait for approval.
4. Install the target on the branch (`npm install <package>@<version>`). Then read what changed in the **target** version: its changelog or release notes, and for `next` the guides in the new `node_modules/next/dist/docs/` (the docs you had before describe the old version). List the breaking changes that touch this repo and fix them.
5. Run `npm run check`, then `npm run build`. **Stop at the first failure.** Report the failing command and its output, leave the branch as it is, and do not continue to another package or try workarounds that change behaviour.
6. One commit per package, imperative message naming both versions. Do not run `npm audit fix`, change `.nvmrc`, or open the PR unless asked.

**Done when:** check and build pass on the new version, the commit contains only the version change plus the fixes it forced, and the report is written.

**Finish with a report:**

- **Verified:** the commands you ran and their results; breaking changes you read and the files you fixed.
- **Not verified:** runtime behaviour. There are no e2e tests, so for `next`, `react`, `framer-motion`, `gsap` or `lenis` say that animations, routing and hydration were not checked in a browser.
- **Next:** the next outdated package, if any.
