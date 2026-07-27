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

export const LIVE_EVENT_WINDOW_MS = 24 * 60 * 60 * 1000;
export const LIVE_EVENT_NEW_MS = 2 * 60 * 60 * 1000;
