import type { Member } from "@/types/member";
import { DEFAULT_PHOTO_URL } from "@/lib/onboarding/status";

export function createDefaultMember(userId: string, email?: string | null): Member {
  const name = email?.split("@")[0] ?? "New Member";

  return {
    id: userId,
    userId,
    name,
    resonanceRate: 0,
    tags: [],
    aiComment: "AIとの対話から、あなたの世界観が見えてきます。",
    photo: DEFAULT_PHOTO_URL,
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
