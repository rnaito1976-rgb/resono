export type Member = {
  id: string;
  userId?: string;
  name: string;
  resonanceRate: number;
  tags: string[];
  aiComment: string;
  photo: string;
  portrait: {
    bio: string;
    age: number;
    location: string;
    influences: string[];
    dialogueCompleted?: boolean;
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

export type DetailSection = "portrait" | "music" | "fashion" | "lookingFor";

export const DETAIL_SECTIONS: {
  id: DetailSection;
  label: string;
}[] = [
  { id: "portrait", label: "Portrait" },
  { id: "music", label: "Music" },
  { id: "fashion", label: "Fashion" },
  { id: "lookingFor", label: "Looking For" },
];
