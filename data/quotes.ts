import type { ResidentQuote } from "@/types";

/**
 * "Зборови на нашите станари" on the homepage. TODO(client): the three real statements with the resident's name and
 * project (docs/content-needed.md). With no quotes the section does not appear.
 */
export const residentQuotes: ResidentQuote[] = [
  { text: "[Изјава од станар, една до две реченици.]", name: "[ИМЕ]", project: "[ПРОЕКТ]" },
  { text: "[Втора изјава: за квалитетот или тимот.]", name: "[ИМЕ]", project: "[ПРОЕКТ]" },
  { text: "[Трета изјава: за животот во зградата.]", name: "[ИМЕ]", project: "[ПРОЕКТ]" },
];
