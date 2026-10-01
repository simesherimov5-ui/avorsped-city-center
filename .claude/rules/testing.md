---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

- Test pure logic (formatting, filtering, data helpers) with Vitest. Import `describe`/`it`/`expect` from `vitest`.
- Assert exact output strings. Don't snapshot markup or assert Tailwind classes.
- Colocate tests next to the module as `name.test.ts`.
- A bug fix includes a test that failed before the fix.
