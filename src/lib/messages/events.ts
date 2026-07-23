export const MESSAGES_CHANGE_EVENT = "resono-messages-change";

export function dispatchMessagesChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(MESSAGES_CHANGE_EVENT));
}
