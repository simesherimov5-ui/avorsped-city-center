/** Cuts a text to about `max` characters, at a word where there is one (search results show roughly 155–160). */
export function truncate(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 30)).replace(/[\s,;:.—-]+$/, "") + "…";
}
