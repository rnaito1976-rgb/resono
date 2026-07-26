import { applyProfileAiComment } from "@/lib/profile/ai-comment";
import type { Member } from "@/types/member";
import type {
  LegacyProfileCard,
  ProfileItem,
  ProfileItemKind,
  ProfileEditSection,
} from "@/types/profile-item";
import {
  PROFILE_ITEM_EDIT_SECTIONS,
  PROFILE_ITEM_LABELS,
} from "@/types/profile-item";

export type ProfileConversationStep = {
  id: string;
  kind: ProfileItemKind;
  message: string;
  placeholder: string;
};

/** AI会話でプロフィール項目を追加する質問一覧 */
export const PROFILE_CONVERSATION_STEPS: ProfileConversationStep[] = [
  {
    id: "live-ritual",
    kind: "live-ritual",
    message: "ライブ前に必ず聴く曲は？",
    placeholder: "RADIOHEAD - Weird Fishes",
  },
  {
    id: "guitar-heroes",
    kind: "guitar-heroes",
    message: "影響を受けたギタリストは？",
    placeholder: "Jonny Greenwood",
  },
  {
    id: "favorite-live",
    kind: "favorite-live",
    message: "人生で忘れられないライブは？",
    placeholder: "Radiohead @ Fuji Rock 2016",
  },
  {
    id: "dream-band",
    kind: "dream-band",
    message: "いつか組みたい理想のバンド像は？",
    placeholder: "静かな緊張感と即興が共存する4人組",
  },
  {
    id: "first-album",
    kind: "first-album",
    message: "はじめて買ったアルバムは？",
    placeholder: "OK Computer",
  },
  {
    id: "fashion-style",
    kind: "fashion-style",
    message: "ステージや日常での個性の方向性は？",
    placeholder: "モノトーンにアクセントカラー",
  },
  {
    id: "current-obsession",
    kind: "current-obsession",
    message: "今ハマっている音楽は？",
    placeholder: "UKガレージの再評価",
  },
  {
    id: "favorite-gear",
    kind: "favorite-gear",
    message: "愛用の機材・楽器は？",
    placeholder: "Fender Jazz Bass",
  },
  {
    id: "creative-process",
    kind: "creative-process",
    message: "曲やアイデアはどうやって生まれる？",
    placeholder: "深夜の即興から断片を残す",
  },
];

export function getProfileItemLabel(kind: ProfileItemKind): string {
  return PROFILE_ITEM_LABELS[kind];
}

export function migrateLegacyCardToItem(card: LegacyProfileCard): ProfileItem {
  return {
    kind: card.kind,
    value: card.content,
    detail: card.subtitle,
    updatedAt: card.createdAt ?? new Date().toISOString(),
  };
}

export function normalizeProfileItems(raw: unknown): ProfileItem[] {
  const value = (raw ?? {}) as {
    profileItems?: ProfileItem[];
    profileCards?: LegacyProfileCard[];
  };

  if (Array.isArray(value.profileItems) && value.profileItems.length > 0) {
    return value.profileItems.filter(isValidProfileItem);
  }

  if (Array.isArray(value.profileCards) && value.profileCards.length > 0) {
    return value.profileCards.map(migrateLegacyCardToItem);
  }

  return [];
}

function isValidProfileItem(item: unknown): item is ProfileItem {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Partial<ProfileItem>;
  return Boolean(
    candidate.kind &&
      typeof candidate.value === "string" &&
      typeof candidate.updatedAt === "string"
  );
}

export function getProfileItems(member: Member): ProfileItem[] {
  return member.portrait.profileItems ?? [];
}

export function getProfileItemsForEditSection(
  member: Member,
  section: ProfileEditSection
): ProfileItem[] {
  return getProfileItems(member).filter(
    (item) => PROFILE_ITEM_EDIT_SECTIONS[item.kind] === section
  );
}

export function hasProfileItemKind(member: Member, kind: ProfileItemKind): boolean {
  return getProfileItems(member).some((item) => item.kind === kind);
}

export function getPendingConversationSteps(member: Member): ProfileConversationStep[] {
  return PROFILE_CONVERSATION_STEPS.filter(
    (step) => !hasProfileItemKind(member, step.kind)
  );
}

export function createProfileItem(input: {
  kind: ProfileItemKind;
  value: string;
  detail?: string;
}): ProfileItem {
  return {
    kind: input.kind,
    value: input.value.trim(),
    detail: input.detail?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };
}

export function createMusicDnaItem(artists: string[]): ProfileItem {
  return createProfileItem({
    kind: "music-dna",
    value: artists.join("\n"),
  });
}

export function setProfileItem(member: Member, item: ProfileItem): Member {
  const existing = getProfileItems(member).filter((entry) => entry.kind !== item.kind);

  return {
    ...member,
    portrait: {
      ...member.portrait,
      profileItems: [...existing, { ...item, updatedAt: new Date().toISOString() }],
    },
  };
}

export function updateProfileItemValue(
  member: Member,
  kind: ProfileItemKind,
  value: string,
  detail?: string
): Member {
  return setProfileItem(
    member,
    createProfileItem({
      kind,
      value,
      detail: detail ?? getProfileItems(member).find((item) => item.kind === kind)?.detail,
    })
  );
}

export function parseLiveRitualAnswer(raw: string): { value: string; detail?: string } {
  const trimmed = raw.trim();
  const dashIndex = trimmed.indexOf(" - ");
  const hyphenIndex = trimmed.indexOf("-");

  if (dashIndex > 0) {
    return {
      detail: trimmed.slice(0, dashIndex).trim(),
      value: trimmed.slice(dashIndex + 3).trim(),
    };
  }

  if (hyphenIndex > 0) {
    return {
      detail: trimmed.slice(0, hyphenIndex).trim(),
      value: trimmed.slice(hyphenIndex + 1).trim(),
    };
  }

  return { value: trimmed };
}

export function buildItemFromConversationAnswer(
  step: ProfileConversationStep,
  answer: string
): ProfileItem {
  if (step.kind === "live-ritual") {
    const parsed = parseLiveRitualAnswer(answer);
    return createProfileItem({
      kind: step.kind,
      value: parsed.value || answer.trim(),
      detail: parsed.detail,
    });
  }

  return createProfileItem({
    kind: step.kind,
    value: answer.trim(),
  });
}

export function formatProfileItemForEdit(item: ProfileItem): string {
  if (item.kind === "music-dna") {
    return item.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(", ");
  }

  if (item.detail) {
    return `${item.detail} - ${item.value}`;
  }

  return item.value;
}

export function parseProfileItemFromEdit(kind: ProfileItemKind, raw: string): ProfileItem {
  const trimmed = raw.trim();

  if (kind === "music-dna") {
    const artists = trimmed
      .split(/[,、\n]/)
      .map((part) => part.trim())
      .filter(Boolean);
    return createProfileItem({ kind, value: artists.join("\n") });
  }

  if (kind === "live-ritual") {
    const parsed = parseLiveRitualAnswer(trimmed);
    return createProfileItem({
      kind,
      value: parsed.value,
      detail: parsed.detail,
    });
  }

  return createProfileItem({ kind, value: trimmed });
}

export function syncMemberFromProfileItems(member: Member): Member {
  const items = getProfileItems(member);
  const musicDna = items.find((item) => item.kind === "music-dna");

  if (!musicDna) {
    return member;
  }

  const artists = musicDna.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    ...member,
    tags: artists.length > 0 ? artists.slice(0, 3) : member.tags,
    music: {
      ...member.music,
      favoriteArtists: artists,
    },
  };
}

/** Music セクションの編集を Music DNA 項目へ反映 */
export function syncProfileItemsFromMemberFields(member: Member): Member {
  const artists = member.music.favoriteArtists.filter(Boolean);
  if (artists.length === 0) {
    return member;
  }

  return setProfileItem(member, createMusicDnaItem(artists));
}

/** 保存前: 項目 ↔ メンバーフィールドを双方向同期 + AIコメント再生成 */
export function prepareMemberForSave(member: Member): Member {
  return applyProfileAiComment(
    syncMemberFromProfileItems(syncProfileItemsFromMemberFields(member))
  );
}
