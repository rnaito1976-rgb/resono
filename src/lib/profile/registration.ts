import { applyProfileAiComment } from "@/lib/profile/ai-comment";
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

  return applyProfileAiComment({
    ...member,
    name: input.name.trim(),
    photo: input.photo.trim(),
    tags: artists.slice(0, 3),
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
  });
}
