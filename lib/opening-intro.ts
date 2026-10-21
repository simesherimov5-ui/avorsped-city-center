/**
 * The cinematic intro of a project's opening plays once per visitor per week. "Played" is a timestamp in localStorage;
 * reduced motion and Save-Data never play it. Reads and writes are wrapped: if storage throws (a blocked or full
 * browser store), the intro plays.
 */
export const INTRO_KEY = "cc-intro-played";
export const INTRO_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Seconds before the end of the film at which the title starts building. */
export const INTRO_TITLE_LEAD_S = 3.2;

/** True where the intro must not play (played within the week, reduced motion, Save-Data). Client only. */
export function introSkipped(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return true;
  try {
    const at = Number(window.localStorage.getItem(INTRO_KEY));
    return at > 0 && Date.now() - at < INTRO_TTL_MS;
  } catch {
    return false;
  }
}

export function markIntroPlayed() {
  try {
    window.localStorage.setItem(INTRO_KEY, String(Date.now()));
  } catch {
    // storage blocked: the intro plays again next time
  }
}

/**
 * Runs in the page's HTML (root layout) before the first paint, on a page that has an intro (`paths`): puts
 * data-cc-intro="film" on <html> when the intro will play, so the covered state is there from the first frame and a repeat
 * visit never flashes it. The same rules as introSkipped(). A last-resort timer takes the attribute off again (the page
 * can never stay covered).
 */
export const introBootScript = (paths: string[]) =>
  `(function(){try{var p=location.pathname;if(p.length>1&&p.slice(-1)==="/")p=p.slice(0,-1);if(${JSON.stringify(paths)}.indexOf(p)<0)return;var d=document.documentElement,s=false;try{var t=+localStorage.getItem("${INTRO_KEY}");s=t>0&&Date.now()-t<${INTRO_TTL_MS}}catch(e){}if(matchMedia("(prefers-reduced-motion: reduce)").matches)s=true;var c=navigator.connection;if(c&&c.saveData)s=true;if(!s){d.setAttribute("data-cc-intro","film");setTimeout(function(){d.removeAttribute("data-cc-intro")},45000)}}catch(e){}})()`;
