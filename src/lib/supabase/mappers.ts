import type { Database } from "@/types/database";
import type { Member } from "@/types/member";
import {
  EMPTY_FASHION,
  EMPTY_PORTRAIT,
} from "@/lib/members/defaults";

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
    portrait: row.portrait as Member["portrait"],
    music: row.music as Member["music"],
    fashion: row.fashion as Member["fashion"],
    lookingFor: normalizeLookingFor(row.looking_for),
  };
}

function normalizeLookingFor(raw: unknown): Member["lookingFor"] {
  const value = (raw ?? {}) as Partial<Member["lookingFor"]>;

  return {
    parts: Array.isArray(value.parts)
      ? value.parts.filter((part): part is string => typeof part === "string")
      : [],
    bandVision: typeof value.bandVision === "string" ? value.bandVision : "",
    commitment: typeof value.commitment === "string" ? value.commitment : "",
  };
}
