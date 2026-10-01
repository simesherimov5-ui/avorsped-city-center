@AGENTS.md

<!--
Maintainer note (stripped from context): keep this file under 60 lines, never over 200.
Only repo-wide facts Claude cannot read from the code belong here.
Part-of-repo rules go in .claude/rules/*.md (paths:) or a nested CLAUDE.md; procedures are skills in .claude/skills/;
anything that must always happen is a hook, lint rule, CI step or permission in .claude/settings.json.
Planned config and its triggers: "Claude Code setup: later" in docs/roadmap.md.
-->

# Јавор Шпед City Center

Mock-data sales prototype, not live. Assume anything you push may be public.

## Commands

- `npm run check`: lint + typecheck + format check + unit tests. Must pass before you say work is done (a Stop hook runs it).
- `npm run build`: also run it for route, config or data changes. CI runs both.
- `npm run dev`: for UI changes load the affected route. There are no e2e tests yet; say so if you couldn't.
- `npm ci` once in a fresh checkout (AGENTS.md's docs path needs `node_modules`).

## Conventions

- Pages import data from `@/data` (or `@/data/dojran`). Only `data/` knows how data is generated.
- Project photography goes through `components/ui/Media.tsx`; status and type labels come from `lib/format.ts`. Lint enforces the Media rule and apartment-status labels, with a baseline of known exceptions in `eslint.config.mjs`.
- Use the colour tokens in `app/globals.css`. Don't add hex colours.
- Component, animation and design rules load from `.claude/rules/` when you touch those files.
- Before changing routing, metadata, caching or `next.config.ts`, read the matching guide in `node_modules/next/dist/docs/`.

## Ask first

- What `.claude/settings.json` marks as `ask`, plus new dependencies and anything under `public/` (client assets).
- Changing the visual direction (palette, typography, layout concept, motion style): needs an approved entry in `docs/design-brief.md`. Design skills only propose; use `/design-proposal`.
- Never commit `.env*`, client documents, prices or personal data, and keep them out of commit and PR text.

## Workflow

- Touching 3 or more files: plan first, list the files, wait for approval.
- One concern per commit, imperative messages, committed after each verified step. Work on a branch and merge through a pull request; never push to `main`.
- Skills: `/roadmap-item <n>`, `/ux-audit`, `/design-proposal`, `/dependency-update`, `/pr-ready`. Ask the `reviewer` subagent to review the diff before a PR.
- Planned work lives in `docs/roadmap.md` (read it before a roadmap item); design decisions in `docs/design-brief.md`.
