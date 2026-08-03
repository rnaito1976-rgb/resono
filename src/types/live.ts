import type { FrequencyColorHex } from "@/lib/frequency-color/types";

export type LiveEventKind =
  | "new_member"
  | "new_band"
  | "band_formed"
  | "new_video"
  | "looking_for_updated";

export type LiveEvent = {
  id: string;
  kind: LiveEventKind;
  title: string;
  subtitle?: string;
  href: string;
  photo?: string;
  actorMemberId?: string;
  bandId?: string;
  gradientColors?: FrequencyColorHex[];
  createdAt: string;
  isNew: boolean;
};

export const LIVE_EVENT_KIND_LABELS: Record<LiveEventKind, string> = {
  new_member: "New Member",
  new_band: "New Band",
  band_formed: "Band Formed",
  new_video: "New Video",
  looking_for_updated: "Looking For Updated",
};

/** Home Live strip always shows this many cards (latest first). */
export const LIVE_FEED_SIZE = 5;

export const LIVE_FEED_KINDS = [
  "new_member",
  "new_band",
  "band_formed",
  "new_video",
] as const satisfies readonly LiveEventKind[];

export type LiveFeedKind = (typeof LIVE_FEED_KINDS)[number];

export const LIVE_EVENT_WINDOW_MS = 48 * 60 * 60 * 1000;
export const LIVE_EVENT_NEW_MS = LIVE_EVENT_WINDOW_MS;

export function isLiveFeedKind(kind: string): kind is LiveFeedKind {
  return (LIVE_FEED_KINDS as readonly string[]).includes(kind);
}
