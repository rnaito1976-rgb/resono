import type { Member } from "@/types/member";

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80";

export function createDefaultMember(userId: string, email?: string | null): Member {
  const name = email?.split("@")[0] ?? "New Member";

  return {
    id: userId,
    userId,
    name,
    resonanceRate: 50,
    tags: [],
    aiComment: "プロフィールを整えて、共鳴する人を見つけましょう。",
    photo: DEFAULT_PHOTO,
    portrait: {
      bio: "",
      age: 0,
      location: "",
      influences: [],
    },
    music: {
      genres: [],
      favoriteArtists: [],
      instruments: [],
      listeningMood: "",
    },
    fashion: {
      style: "",
      colors: [],
      brands: [],
      description: "",
    },
    mood: {
      keywords: [],
      atmosphere: "",
      creativeTime: "",
      description: "",
    },
    lookingFor: {
      parts: [],
      bandVision: "",
      commitment: "",
    },
  };
}
