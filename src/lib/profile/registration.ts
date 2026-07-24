import { createMusicDnaItem } from "@/lib/profile/items";
import type { Member } from "@/types/member";

export type MinimalRegistrationInput = {
  name: string;
  photo: string;
  part: string;
  favoriteArtists: string[];
};

export function isMinimalRegistrationInputComplete(
  input: Partial<MinimalRegistrationInput>
): input is MinimalRegistrationInput {
  return Boolean(
    input.name?.trim() &&
      input.photo?.trim() &&
      input.part?.trim() &&
      input.favoriteArtists &&
      input.favoriteArtists.length === 3
  );
}

export function buildMemberFromMinimalRegistration(
  member: Member,
  input: MinimalRegistrationInput
): Member {
  const artists = input.favoriteArtists.map((artist) => artist.trim()).filter(Boolean);
  const musicDnaItem = createMusicDnaItem(artists);

  return {
    ...member,
    name: input.name.trim(),
    photo: input.photo.trim(),
    tags: artists.slice(0, 3),
    aiComment: `${artists.slice(0, 2).join("と")}あたりの音楽性。${input.part}として、少しずつプロフィールを育てていく。`,
    portrait: {
      ...member.portrait,
      bio: "",
      dialogueCompleted: true,
      profileItems: [
        musicDnaItem,
        ...(member.portrait.profileItems ?? []).filter((item) => item.kind !== "music-dna"),
      ],
    },
    music: {
      ...member.music,
      instruments: [input.part.trim()],
      favoriteArtists: artists,
    },
  };
}
