import type { ProfileItem } from "@/types/profile-item";
import type { MemberMusicProfile } from "@/types/music-profile";
import type { MemberActivityMilestone } from "@/lib/members/initial-activities";
import type { MemberResonanceSignals } from "@/types/resonance-signals";

export type Member = {
  id: string;
  userId?: string;
  name: string;
  frequencyColor?: string;
  resonanceRate: number;
  tags: string[];
  aiComment: string;
  photo: string;
  portrait: {
    bio: string;
    age: number;
    location: string;
    influences: string[];
    /** 初回登録（最低限プロフィール）が完了している */
    dialogueCompleted?: boolean;
    /** AI会話で増えていくプロフィール項目 */
    profileItems?: ProfileItem[];
    /** 初回登録時の Activity マイルストーン */
    activityMilestones?: MemberActivityMilestone[];
    /**
     * AI会話由来の内部シグナル。
     * 共鳴度計算には使うが、プロフィール表示には出さない。
     */
    resonanceSignals?: MemberResonanceSignals;
  };
  music: MemberMusicProfile;
  fashion: {
    style: string;
    colors: string[];
    brands: string[];
    description: string;
  };
  lookingFor: {
    parts: string[];
    bandVision: string;
    commitment: string;
    setList?: string[];
    liveHistory?: string[];
  };
};

export type DetailSection = "portrait" | "music" | "lookingFor" | "activity";

export const DETAIL_SECTIONS: {
  id: DetailSection;
  label: string;
}[] = [
  { id: "portrait", label: "About" },
  { id: "music", label: "Music" },
  { id: "lookingFor", label: "Band" },
];

export const OWN_PROFILE_DETAIL_SECTIONS: {
  id: DetailSection;
  label: string;
}[] = [
  ...DETAIL_SECTIONS,
  { id: "activity", label: "Activity" },
];

const ACTIVITY_SECTION = { id: "activity" as const, label: "Activity" };

/** Activity は常に末尾（About / Music / Band の後） */
export function getOwnProfileDetailSections(_hasActivityContent = false) {
  return [...DETAIL_SECTIONS, ACTIVITY_SECTION];
}
