import { applyProfileAiComment } from "@/lib/profile/ai-comment";
import { attachInitialMemberActivities } from "@/lib/members/initial-activities";
import { createMusicDnaItem } from "@/lib/profile/items";
import { NO_PHOTO_URL } from "@/lib/onboarding/status";
import type { Member } from "@/types/member";

export type MinimalRegistrationInput = {
  name: string;
  photo: string;
  part: string;
  parts?: string[];
  favoriteArtists: string[];
  sounds?: string[];
};

function resolveInstruments(input: Partial<MinimalRegistrationInput>): string[] {
  if (input.parts?.length) {
    return input.parts.map((part) => part.trim()).filter(Boolean);
  }

  return input.part?.trim() ? [input.part.trim()] : [];
}

export function isMinimalRegistrationInputComplete(
  input: Partial<MinimalRegistrationInput>
): input is MinimalRegistrationInput {
  const artists = input.favoriteArtists?.map((artist) => artist.trim()).filter(Boolean) ?? [];

  return Boolean(
    input.name?.trim() &&
      input.photo !== undefined &&
      resolveInstruments(input).length >= 1 &&
      artists.length >= 1
  );
}

export function buildMemberFromMinimalRegistration(
  member: Member,
  input: MinimalRegistrationInput
): Member {
  const artists = input.favoriteArtists.map((artist) => artist.trim()).filter(Boolean);
  const instruments = resolveInstruments(input);
  const genres = (input.sounds ?? []).map((sound) => sound.trim()).filter(Boolean);
  const musicDnaItem = createMusicDnaItem(artists);
  const photo = input.photo.trim() || NO_PHOTO_URL;

  return attachInitialMemberActivities(
    applyProfileAiComment({
      ...member,
      name: input.name.trim(),
      photo,
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
        instruments,
        favoriteArtists: artists,
        genres,
      },
    })
  );
}
