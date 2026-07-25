import type { BandActivityKind, BandTimelineKind } from "@/types/band";
import type { Member } from "@/types/member";

export type MemberActivityKind =
  | "mutual_resonance"
  | "resonance_sent"
  | "resonance_received"
  | "band_formed"
  | "member_joined"
  | "band_post"
  | "timeline";

export type MemberActivityFeedItem = {
  id: string;
  kind: MemberActivityKind;
  occurredAt: string;
  title: string;
  body?: string;
  bandId?: string;
  bandName?: string;
  partnerMember?: Member;
  mediaUrl?: string;
  activityKind?: BandActivityKind;
  timelineKind?: BandTimelineKind;
};
