export const BANDS_CHANGE_EVENT = "resono-bands-change";

export function dispatchBandsChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(BANDS_CHANGE_EVENT));
}
