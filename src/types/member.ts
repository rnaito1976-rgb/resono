import type { ProfileCard } from "@/types/profile-card";

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
    /** AI会話で増えていくプロフィールカード */
    profileCards?: ProfileCard[];
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

export type DetailSection = "portrait" | "music" | "lookingFor";

export const DETAIL_SECTIONS: {
  id: DetailSection;
  label: string;
}[] = [
  { id: "portrait", label: "Journal" },
  { id: "music", label: "Music" },
  { id: "lookingFor", label: "Band" },
];
