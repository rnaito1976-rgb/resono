/** Profile bottom sheet height (もっと知る). */
export const PROFILE_SHEET_HEIGHT = "95dvh";

/** @deprecated Use PROFILE_SHEET_HEIGHT */
export const HOME_HEADER_SHEET_TOP = "5rem";

export function scrollHomeToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
