import type { ProfileItem } from "@/types/profile-item";

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
  };
  music: {
    genres: string[];
    favoriteArtists: string[];
    instruments: string[];
    listeningMood: string;
  };
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
