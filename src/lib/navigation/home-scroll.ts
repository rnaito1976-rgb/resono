/** Profile sheet top offset — sheet rises until it overlaps the home header logo. */
export const HOME_HEADER_SHEET_TOP = "5rem";

export function scrollHomeToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
