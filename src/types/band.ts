import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import type { Member } from "@/types/member";

export type BandActivityStatus = "forming" | "active" | "paused" | "archived";

export type BandTimelineKind =
  | "first_resonance"
  | "band_formed"
  | "first_studio"
  | "first_live"
  | "video_added"
  | "member_joined"
  | "activity";

export type BandActivityKind = "text" | "photo" | "video";

/** Future modules: sessions, live, discography, archive */
export type BandModuleId =
  | "timeline"
  | "activity"
  | "videos"
  | "members"
  | "sessions"
  | "live"
  | "discography"
  | "archive";

export type Band = {
  id: string;
  name: string;
  accentColor?: FrequencyColorHex;
  activityStatus: BandActivityStatus;
  createdByMemberId: string;
  createdAt: string;
};

export type BandMember = {
  bandId: string;
  memberId: string;
  joinedAt: string;
  member: Member;
  frequencyColor?: FrequencyColorHex;
  resonanceScore?: number;
  resonatedAt?: string;
};

export type BandTimelineEvent = {
  id: string;
  bandId: string;
  kind: BandTimelineKind;
  title: string;
  body?: string;
  occurredAt: string;
  activityId?: string;
};

export type BandActivity = {
  id: string;
  bandId: string;
  authorMemberId: string;
  kind: BandActivityKind;
  title?: string;
  body?: string;
  mediaUrl?: string;
  createdAt: string;
  author?: Member;
};

export type BandActivityFeedItem = BandActivity & {
  bandName: string;
};

export type BandDetail = {
  band: Band;
  members: BandMember[];
  timeline: BandTimelineEvent[];
  activities: BandActivity[];
  gradientColors: FrequencyColorHex[];
};

export type MutualResonateMember = {
  member: Member;
  frequencyColor?: FrequencyColorHex;
  resonatedAt: string;
  conversationId?: string;
};
