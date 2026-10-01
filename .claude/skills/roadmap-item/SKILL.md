---
name: roadmap-item
description: Plan and implement one item from docs/roadmap.md the way this repo expects: plan first, small verified commits, no merge.
disable-model-invocation: true
argument-hint: "[roadmap item number or name]"
arguments: [item]
---

Work on roadmap item **$item** from `docs/roadmap.md`.

1. Read `docs/roadmap.md` and `CLAUDE.md`. Find the item and its "Done when". If it doesn't exist or is ambiguous, ask which one. Don't guess.
2. Check the starting point: `git status` (clean?), the current branch (not `main`), and run `npm run check`. If it is red, report that and stop, unless fixing it is the item.
3. **Plan, then stop.** List the files you will create or change, the approach, the risks, the tests you will add, and how you will know it is done. Flag anything under "Ask first" in `CLAUDE.md`. Wait for approval before editing anything.
4. Implement in small commits, one concern each, with imperative messages. After each commit run `npm run check`. Run `npm run build` when routes, config or data change. For UI changes, run the dev server and load the route; if you can't, say so.
5. Update `docs/roadmap.md` if a decision changed or a known gap closed.
6. Finish with: what changed; what you verified (with the command output) and what you did not; and the next roadmap item. Don't merge. Open a pull request only if asked.
