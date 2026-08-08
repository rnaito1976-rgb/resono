import type { Database } from "@/types/database";
import type { Member } from "@/types/member";
import type { MemberMusicProfile } from "@/types/music-profile";
import {
  EMPTY_FASHION,
  EMPTY_PORTRAIT,
} from "@/lib/members/defaults";
import { normalizeProfileItems } from "@/lib/profile/items";
import type { MemberActivityMilestone } from "@/lib/members/initial-activities";
import { normalizeActivityStyle } from "@/lib/music/activity-style";

type MemberRow = Database["public"]["Tables"]["members"]["Row"];
type MemberInsert = Database["public"]["Tables"]["members"]["Insert"];
type MemberListRow = Pick<
  MemberRow,
  | "id"
  | "user_id"
  | "name"
  | "resonance_rate"
  | "tags"
  | "ai_comment"
  | "photo"
  | "music"
  | "looking_for"
>;
type MemberDetailRow = Pick<
  MemberRow,
  | "id"
  | "user_id"
  | "name"
  | "resonance_rate"
  | "tags"
  | "ai_comment"
  | "photo"
  | "portrait"
  | "music"
  | "fashion"
  | "looking_for"
>;

const LEGACY_EMPTY_MOOD = {
  keywords: [] as string[],
  atmosphere: "",
  creativeTime: "",
  description: "",
};

export function memberToRow(member: Member): MemberInsert {
  return {
    id: member.id,
    user_id: member.userId ?? null,
    name: member.name,
    resonance_rate: member.resonanceRate,
    tags: member.tags,
    ai_comment: member.aiComment,
    photo: member.photo,
    portrait: member.portrait,
    music: member.music,
    fashion: member.fashion,
    mood: LEGACY_EMPTY_MOOD,
    looking_for: member.lookingFor,
  };
}

export function rowToMemberList(row: MemberListRow): Member {
  return rowToMember({
    ...row,
    portrait: EMPTY_PORTRAIT,
    fashion: EMPTY_FASHION,
    mood: LEGACY_EMPTY_MOOD,
    created_at: new Date().toISOString(),
  });
}

export function rowToMemberDetail(row: MemberDetailRow): Member {
  return rowToMember({
    ...row,
    mood: LEGACY_EMPTY_MOOD,
    created_at: new Date().toISOString(),
  });
}

export function rowToMember(row: MemberRow): Member {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    name: row.name,
    resonanceRate: row.resonance_rate,
    tags: row.tags,
    aiComment: row.ai_comment,
    photo: row.photo,
    portrait: normalizePortrait(row.portrait),
    music: normalizeMusic(row.music),
    fashion: row.fashion as Member["fashion"],
    lookingFor: normalizeLookingFor(row.looking_for),
  };
}

function normalizeStringList(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }

  const values = raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return values.length > 0 ? values : undefined;
}

function normalizeResonanceSignals(
  raw: unknown
): Member["portrait"]["resonanceSignals"] | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const value = raw as Record<string, unknown>;
  const signals = {
    musicFocus: normalizeStringList(value.musicFocus),
    conversation: normalizeStringList(value.conversation),
    idealMember: normalizeStringList(value.idealMember),
    bandValues: normalizeStringList(value.bandValues),
    notes: normalizeStringList(value.notes),
  };

  if (
    !signals.musicFocus &&
    !signals.conversation &&
    !signals.idealMember &&
    !signals.bandValues &&
    !signals.notes
  ) {
    return undefined;
  }

  return signals;
}

function normalizePortrait(raw: unknown): Member["portrait"] {
  const value = (raw ?? {}) as Partial<Member["portrait"]>;

  return {
    bio: typeof value.bio === "string" ? value.bio : "",
    age: typeof value.age === "number" ? value.age : 0,
    location: typeof value.location === "string" ? value.location : "",
    influences: Array.isArray(value.influences)
      ? value.influences.filter((item): item is string => typeof item === "string")
      : [],
    dialogueCompleted: value.dialogueCompleted === true,
    introOnboardingPending: value.introOnboardingPending === true,
    introOnboardingCompleted: value.introOnboardingCompleted === true,
    profileItems: normalizeProfileItems(raw),
    activityMilestones: normalizeActivityMilestones(value.activityMilestones),
    resonanceSignals: normalizeResonanceSignals(value.resonanceSignals),
  };
}

function normalizeActivityMilestones(raw: unknown): MemberActivityMilestone[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }

  const milestones = raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const milestone = item as Partial<MemberActivityMilestone>;
      if (
        typeof milestone.id !== "string" ||
        typeof milestone.title !== "string" ||
        typeof milestone.occurredAt !== "string"
      ) {
        return null;
      }

      return {
        id: milestone.id,
        title: milestone.title,
        occurredAt: milestone.occurredAt,
        ...(typeof milestone.body === "string" ? { body: milestone.body } : {}),
      } satisfies MemberActivityMilestone;
    })
    .filter((item): item is MemberActivityMilestone => item !== null);

  return milestones.length > 0 ? milestones : undefined;
}

function normalizeLookingFor(raw: unknown): Member["lookingFor"] {
  const value = (raw ?? {}) as Partial<Member["lookingFor"]>;

  return {
    parts: Array.isArray(value.parts)
      ? value.parts.filter((part): part is string => typeof part === "string")
      : [],
    bandVision: typeof value.bandVision === "string" ? value.bandVision : "",
    commitment: typeof value.commitment === "string" ? value.commitment : "",
    setList: Array.isArray(value.setList)
      ? value.setList.filter((item): item is string => typeof item === "string")
      : undefined,
    liveHistory: Array.isArray(value.liveHistory)
      ? value.liveHistory.filter((item): item is string => typeof item === "string")
      : undefined,
  };
}

function normalizeMusic(raw: unknown): MemberMusicProfile {
  const value = (raw ?? {}) as Partial<MemberMusicProfile>;

  return {
    genres: Array.isArray(value.genres)
      ? value.genres.filter((item): item is string => typeof item === "string")
      : [],
    favoriteArtists: Array.isArray(value.favoriteArtists)
      ? value.favoriteArtists.filter((item): item is string => typeof item === "string")
      : [],
    instruments: Array.isArray(value.instruments)
      ? value.instruments.filter((item): item is string => typeof item === "string")
      : [],
    listeningMood: typeof value.listeningMood === "string" ? value.listeningMood : "",
    activityStyle: normalizeActivityStyle(value.activityStyle),
    coverSongs: Array.isArray(value.coverSongs) ? value.coverSongs : undefined,
    coveredSongs: Array.isArray(value.coveredSongs) ? value.coveredSongs : undefined,
    dreamBands: Array.isArray(value.dreamBands)
      ? value.dreamBands.filter((item): item is string => typeof item === "string")
      : undefined,
    playingStyle: Array.isArray(value.playingStyle)
      ? value.playingStyle.filter((item): item is string => typeof item === "string")
      : undefined,
    musicDna: Array.isArray(value.musicDna) ? value.musicDna : undefined,
    favoriteSongs: Array.isArray(value.favoriteSongs)
      ? value.favoriteSongs.filter((item): item is string => typeof item === "string")
      : undefined,
    favoriteLiveHouses: Array.isArray(value.favoriteLiveHouses)
      ? value.favoriteLiveHouses.filter((item): item is string => typeof item === "string")
      : undefined,
    favoriteStudios: Array.isArray(value.favoriteStudios)
      ? value.favoriteStudios.filter((item): item is string => typeof item === "string")
      : undefined,
    favoriteFestivals: Array.isArray(value.favoriteFestivals)
      ? value.favoriteFestivals.filter((item): item is string => typeof item === "string")
      : undefined,
    gear: Array.isArray(value.gear)
      ? value.gear.filter((item): item is string => typeof item === "string")
      : undefined,
    videos: Array.isArray(value.videos)
      ? value.videos.filter((item): item is string => typeof item === "string")
      : undefined,
  };
}
