---
name: ux-audit
description: Audit the site's UX and visual quality and write the findings to docs/ux-audit.md. Changes no source code.
disable-model-invocation: true
argument-hint: "[route or area; default: whole site]"
arguments: [area]
---

Audit **$area** (the whole site if empty). **Write findings to `docs/ux-audit.md` only. Do not edit any other file.**

Cover:

- Visual hierarchy and consistency with `docs/design-brief.md` and the tokens in `app/globals.css`
- Typography, including Macedonian Cyrillic rendering (known issue: the fonts load the latin subset only)
- Mobile layout, spacing and tap targets
- Accessibility: contrast, keyboard focus, alt text, reduced-motion handling
- Performance risks: image and video weight, client-side bundle size, animation cost
- Missing states: empty, loading, error

For each finding give: the route or `file:line`; what is wrong; **evidence** (seen in the browser, or only read from the code: say which); severity (blocker, should fix, or polish); and a suggested roadmap item.

Findings that would change the visual direction go under "Needs client decision". Do not implement them without an approved entry in `docs/design-brief.md`.

If you can run `npm run dev` and view the page, do. Otherwise state clearly that every finding comes from reading the code only.

**Done when:** `docs/ux-audit.md` exists with every finding in the format above, `git diff --name-only` lists only that file, and `npm run check` passes.

**Finish with a report:**

- **Verified:** what you saw in the browser or ran.
- **Not verified:** every finding that comes from reading the code only.
- **Needs the client:** the decisions under "Needs client decision".
