---
name: design-proposal
description: Write a design proposal into docs/design-brief.md for client approval. Changes no code.
disable-model-invocation: true
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: >-
            node "${CLAUDE_PROJECT_DIR}/.claude/hooks/restrict-edit.mjs" docs/design-brief.md
argument-hint: "[topic, e.g. cyrillic-display-font]"
arguments: [topic]
---

Write one proposal about **$topic** into the "Proposals" section of `docs/design-brief.md`. **Edit only `docs/design-brief.md`. Do not edit any source, style or asset file.**

1. Read `docs/design-brief.md` (Direction, As built, Known issues, Decision log, Proposals) and `.claude/rules/design.md`. If the topic is already in the decision log as approved, say so and stop.
2. Gather evidence: `app/globals.css`, `app/layout.tsx` and the components involved. Mark each fact as **seen in the browser** or **read from the code only**. If you can run `npm run dev` and view the route, do; otherwise say every fact is from the code.
3. Add one entry under "Proposals" using the template there: problem with evidence (`file:line`), 2 or 3 options with trade-offs, a recommendation, the files that would change, the Cyrillic and accessibility check, and the questions for the client. Set `Status: Proposed`. Leave "Approved by" empty; never edit the Decision log table or the Direction section.
4. Design skills (UI/UX Pro Max, Frontend Design and similar) may inform the options; they do not decide anything.

**Done when:** the proposal is in the brief with status Proposed, `git diff --name-only` lists only `docs/design-brief.md`, and `npm run check` passes.

**Finish with a report:**

- **Verified:** what you ran and saw (command output, pages loaded).
- **Not verified:** anything from code only, anything needing a browser, font rendering you did not see.
- **Needs the client:** the open questions.
