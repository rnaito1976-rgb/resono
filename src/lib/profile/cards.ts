import type { Member } from "@/types/member";
import type { ProfileCard, ProfileCardKind } from "@/types/profile-card";
import { PROFILE_CARD_TITLES } from "@/types/profile-card";

export type ProfileConversationStep = {
  id: string;
  kind: ProfileCardKind;
  message: string;
  placeholder: string;
  type: "text" | "multi";
  options?: readonly string[];
  min?: number;
};

/** AI会話でプロフィールカードを追加する質問一覧 */
export const PROFILE_CONVERSATION_STEPS: ProfileConversationStep[] = [
  {
    id: "live-ritual",
    kind: "live-ritual",
    message: "ライブ前に必ず聴く曲は？",
    placeholder: "RADIOHEAD - Weird Fishes",
    type: "text",
  },
  {
    id: "guitar-heroes",
    kind: "guitar-heroes",
    message: "影響を受けたギタリストは？",
    placeholder: "Jonny Greenwood",
    type: "text",
  },
  {
    id: "favorite-live",
    kind: "favorite-live",
    message: "人生で忘れられないライブは？",
    placeholder: "Radiohead @ Fuji Rock 2016",
    type: "text",
  },
  {
    id: "dream-band",
    kind: "dream-band",
    message: "いつか組みたい理想のバンド像は？",
    placeholder: "静かな緊張感と即興が共存する4人組",
    type: "text",
  },
  {
    id: "first-album",
    kind: "first-album",
    message: "はじめて買ったアルバムは？",
    placeholder: "OK Computer",
    type: "text",
  },
  {
    id: "fashion-style",
    kind: "fashion-style",
    message: "ステージや日常でのファッションの方向性は？",
    placeholder: "モノトーンにアクセントカラー",
    type: "text",
  },
  {
    id: "current-obsession",
    kind: "current-obsession",
    message: "今ハマっている音楽は？",
    placeholder: "UKガレージの再評価",
    type: "text",
  },
  {
    id: "favorite-gear",
    kind: "favorite-gear",
    message: "愛用の機材・楽器は？",
    placeholder: "Fender Jazz Bass",
    type: "text",
  },
  {
    id: "creative-process",
    kind: "creative-process",
    message: "曲やアイデアはどうやって生まれる？",
    placeholder: "深夜の即興から断片を残す",
    type: "text",
  },
];

export function getProfileCards(member: Member): ProfileCard[] {
  return member.portrait.profileCards ?? [];
}

export function hasProfileCardKind(member: Member, kind: ProfileCardKind): boolean {
  return getProfileCards(member).some((card) => card.kind === kind);
}

export function getPendingConversationSteps(member: Member): ProfileConversationStep[] {
  return PROFILE_CONVERSATION_STEPS.filter(
    (step) => !hasProfileCardKind(member, step.kind)
  );
}

export function createProfileCard(input: {
  kind: ProfileCardKind;
  content: string;
  subtitle?: string;
  sourceQuestionId?: string;
}): ProfileCard {
  return {
    id: `${input.kind}-${Date.now()}`,
    kind: input.kind,
    title: PROFILE_CARD_TITLES[input.kind],
    content: input.content.trim(),
    subtitle: input.subtitle?.trim() || undefined,
    sourceQuestionId: input.sourceQuestionId,
    createdAt: new Date().toISOString(),
  };
}

export function createMusicDnaCard(artists: string[]): ProfileCard {
  return createProfileCard({
    kind: "music-dna",
    content: artists.join("\n"),
    sourceQuestionId: "registration",
  });
}

export function addProfileCard(member: Member, card: ProfileCard): Member {
  const existing = getProfileCards(member);
  const withoutDuplicateKind =
    card.kind === "music-dna"
      ? existing.filter((item) => item.kind !== "music-dna")
      : existing.filter((item) => item.kind !== card.kind);

  return {
    ...member,
    portrait: {
      ...member.portrait,
      profileCards: [...withoutDuplicateKind, card],
    },
  };
}

export function parseLiveRitualAnswer(raw: string): { content: string; subtitle?: string } {
  const trimmed = raw.trim();
  const dashIndex = trimmed.indexOf(" - ");
  const hyphenIndex = trimmed.indexOf("-");

  if (dashIndex > 0) {
    return {
      subtitle: trimmed.slice(0, dashIndex).trim(),
      content: trimmed.slice(dashIndex + 3).trim(),
    };
  }

  if (hyphenIndex > 0) {
    return {
      subtitle: trimmed.slice(0, hyphenIndex).trim(),
      content: trimmed.slice(hyphenIndex + 1).trim(),
    };
  }

  return { content: trimmed };
}

export function buildCardFromConversationAnswer(
  step: ProfileConversationStep,
  answer: string
): ProfileCard {
  if (step.kind === "live-ritual") {
    const parsed = parseLiveRitualAnswer(answer);
    return createProfileCard({
      kind: step.kind,
      content: parsed.content || answer.trim(),
      subtitle: parsed.subtitle,
      sourceQuestionId: step.id,
    });
  }

  return createProfileCard({
    kind: step.kind,
    content: answer.trim(),
    sourceQuestionId: step.id,
  });
}
