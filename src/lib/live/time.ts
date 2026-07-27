import { LIVE_EVENT_NEW_MS } from "@/types/live";

/** Relative time in Japanese (e.g. 2分前, 1時間前). */
export function formatRelativeTime(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) {
    return "";
  }

  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) {
    return "たった今";
  }

  if (minutes < 60) {
    return `${minutes}分前`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}時間前`;
  }

  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

export function isLiveEventNew(iso: string, now = Date.now()): boolean {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) {
    return false;
  }

  return now - then <= LIVE_EVENT_NEW_MS;
}
