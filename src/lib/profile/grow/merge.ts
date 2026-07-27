import { createEmptyCoverSong } from "@/lib/music/cover-songs";
import { PROFILE_GROW_FIELD_LABELS } from "@/lib/profile/grow/labels";
import type { ProfileGrowCandidate, ProfileGrowFieldKey } from "@/types/profile-grow";
import type { Member } from "@/types/member";
import type { MemberActivityMilestone } from "@/lib/members/initial-activities";

function appendUnique(values: string[] | undefined, next: string): string[] {
  const current = values ?? [];
  const normalized = next.trim().toLowerCase();
  if (!normalized || current.some((item) => item.trim().toLowerCase() === normalized)) {
    return current;
  }
  return [...current, next.trim()];
}

function appendParagraph(current: string, next: string): string {
  const trimmed = next.trim();
  if (!trimmed) {
    return current;
  }

  if (!current.trim()) {
    return trimmed;
  }

  if (current.toLowerCase().includes(trimmed.toLowerCase())) {
    return current;
  }

  return `${current.trim()}\n${trimmed}`;
}

export function applyProfileGrowCandidates(
  member: Member,
  candidates: ProfileGrowCandidate[]
): { member: Member; updatedFields: ProfileGrowFieldKey[] } {
  let nextMember = member;
  const updatedFields: ProfileGrowFieldKey[] = [];

  for (const candidate of candidates) {
    const before = JSON.stringify(nextMember);
    nextMember = applyCandidate(nextMember, candidate);
    if (JSON.stringify(nextMember) !== before) {
      updatedFields.push(candidate.field);
    }
  }

  return {
    member: nextMember,
    updatedFields: [...new Set(updatedFields)],
  };
}

function applyCandidate(member: Member, candidate: ProfileGrowCandidate): Member {
  switch (candidate.field) {
    case "aboutMe":
    case "bio":
      return {
        ...member,
        portrait: {
          ...member.portrait,
          bio: appendParagraph(member.portrait.bio, candidate.value),
        },
      };

    case "values":
      return {
        ...member,
        portrait: {
          ...member.portrait,
          influences: appendUnique(member.portrait.influences, `大切:${candidate.value}`),
        },
      };

    case "favoriteArtists":
      return {
        ...member,
        music: {
          ...member.music,
          favoriteArtists: appendUnique(member.music.favoriteArtists, candidate.value),
        },
      };

    case "favoriteSongs":
      return {
        ...member,
        music: {
          ...member.music,
          favoriteSongs: appendUnique(member.music.favoriteSongs, candidate.value),
        },
      };

    case "favoriteBands":
      return {
        ...member,
        music: {
          ...member.music,
          dreamBands: appendUnique(member.music.dreamBands, candidate.value),
        },
      };

    case "genres":
      return {
        ...member,
        music: {
          ...member.music,
          genres: appendUnique(member.music.genres, candidate.value),
        },
      };

    case "wantToCover": {
      const coverSong = {
        ...createEmptyCoverSong(member.id, candidate.id),
        title: candidate.value,
        artist: candidate.detail ?? "",
      };
      const existing = member.music.coverSongs ?? [];
      const duplicate = existing.some(
        (song) =>
          song.title.trim().toLowerCase() === candidate.value.trim().toLowerCase() &&
          (song.artist ?? "").trim().toLowerCase() === (candidate.detail ?? "").trim().toLowerCase()
      );

      if (duplicate) {
        return member;
      }

      return {
        ...member,
        music: {
          ...member.music,
          coverSongs: [...existing, coverSong],
        },
      };
    }

    case "wantToPlay":
      return {
        ...member,
        music: {
          ...member.music,
          instruments: appendUnique(member.music.instruments, candidate.value),
        },
      };

    case "favoriteLiveHouses":
      return {
        ...member,
        music: {
          ...member.music,
          favoriteLiveHouses: appendUnique(member.music.favoriteLiveHouses, candidate.value),
        },
      };

    case "favoriteStudios":
      return {
        ...member,
        music: {
          ...member.music,
          favoriteStudios: appendUnique(member.music.favoriteStudios, candidate.value),
        },
      };

    case "favoriteFestivals":
      return {
        ...member,
        music: {
          ...member.music,
          favoriteFestivals: appendUnique(member.music.favoriteFestivals, candidate.value),
        },
      };

    case "gear":
      return {
        ...member,
        music: {
          ...member.music,
          gear: appendUnique(member.music.gear, candidate.value),
        },
      };

    case "videos":
      return {
        ...member,
        music: {
          ...member.music,
          videos: appendUnique(member.music.videos, candidate.value),
        },
      };

    case "lookingFor":
      return {
        ...member,
        lookingFor: {
          ...member.lookingFor,
          parts: appendUnique(member.lookingFor.parts, candidate.value),
        },
      };

    case "style":
      return {
        ...member,
        lookingFor: {
          ...member.lookingFor,
          bandVision: appendParagraph(member.lookingFor.bandVision, candidate.value),
        },
      };

    case "schedule":
      return {
        ...member,
        lookingFor: {
          ...member.lookingFor,
          commitment: appendParagraph(member.lookingFor.commitment, candidate.value),
        },
      };

    case "setList":
      return {
        ...member,
        lookingFor: {
          ...member.lookingFor,
          setList: appendUnique(member.lookingFor.setList, candidate.value),
        },
      };

    case "liveHistory":
      return {
        ...member,
        lookingFor: {
          ...member.lookingFor,
          liveHistory: appendUnique(member.lookingFor.liveHistory, candidate.value),
        },
      };
  }
}

export function buildProfileGrowActivityMilestone(
  updatedFields: ProfileGrowFieldKey[]
): MemberActivityMilestone | null {
  if (updatedFields.length === 0) {
    return null;
  }

  const lines = updatedFields.map(
    (field) => `・${PROFILE_GROW_FIELD_LABELS[field]} を更新しました`
  );

  return {
    id: `grow-${Date.now()}`,
    title: "プロフィールを更新しました",
    body: lines.join("\n"),
    occurredAt: new Date().toISOString(),
  };
}

export function appendProfileGrowActivity(
  member: Member,
  milestone: MemberActivityMilestone | null
): Member {
  if (!milestone) {
    return member;
  }

  const current = member.portrait.activityMilestones ?? [];

  return {
    ...member,
    portrait: {
      ...member.portrait,
      activityMilestones: [milestone, ...current],
    },
  };
}
