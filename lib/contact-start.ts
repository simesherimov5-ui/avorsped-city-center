/** Old `?project=` values from before a project was renamed: they still pre-select it. */
export const LEGACY_PROJECTS: Record<string, string> = { "vista-heights": "stanbena-kukja" };

/**
 * The project the booking form opens with, from a `?project=` value: the project itself when the form lists it (an old
 * address mapped first), else nothing (a finished project, an unknown value).
 */
export function startProjectId(value: string | undefined, listed: string[]): string | undefined {
  if (!value) return undefined;
  const id = LEGACY_PROJECTS[value] ?? value;
  return listed.includes(id) ? id : undefined;
}
