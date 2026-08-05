import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Member } from "@/types/member";

const MIN_INDEXABLE_TEXT_LENGTH = 24;

const DEFAULT_MEMBER_PRIVATE_DESCRIPTION =
  "RESONOのメンバープロフィール。ログインして詳細を確認できます。";

function normalizeText(value: string | undefined): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function getPrimaryInfluence(member: Member): string | null {
  const influence = member.portrait.influences.find((item) => normalizeText(item));
  return influence ? normalizeText(influence) : null;
}

function getPrimaryPart(member: Member): string | null {
  const instrument = member.music.instruments.find((item) => normalizeText(item));
  if (instrument) {
    return normalizeText(instrument);
  }

  const recruitingPart = member.lookingFor.parts.find((item) => normalizeText(item));
  return recruitingPart ? normalizeText(recruitingPart) : null;
}

function getProfileSummary(member: Member): string {
  const chunks = [
    normalizeText(member.portrait.bio),
    normalizeText(member.aiComment),
    member.music.genres.filter(Boolean).join("、"),
    member.music.playingStyle?.filter(Boolean).join("、") ?? "",
    normalizeText(member.lookingFor.bandVision),
  ].filter(Boolean);

  return chunks.join(" ");
}

export function isMemberIndexable(member: Member): boolean {
  const hasMusicSignal = Boolean(getPrimaryInfluence(member) || getPrimaryPart(member));
  const hasRecruitment = member.lookingFor.parts.some((part) => normalizeText(part));
  const summary = getProfileSummary(member);

  return hasMusicSignal && (hasRecruitment || summary.length >= MIN_INDEXABLE_TEXT_LENGTH);
}

export function buildMemberSeoTitle(member: Member): string {
  const influence = getPrimaryInfluence(member);
  const part = getPrimaryPart(member);

  if (influence && part) {
    return `${influence}好きの${part}｜RESONO`;
  }

  if (part) {
    return `${part}のバンドメンバー募集｜RESONO`;
  }

  if (influence) {
    return `${influence}好きの音楽仲間｜RESONO`;
  }

  return "バンドメンバー募集・音楽仲間｜RESONO";
}

export function buildMemberSeoDescription(member: Member): string {
  const influence = getPrimaryInfluence(member);
  const part = getPrimaryPart(member);
  const recruitingParts = member.lookingFor.parts.filter(Boolean);

  const leadParts: string[] = [];

  if (influence && part) {
    leadParts.push(`${influence}好きの${part}`);
  } else if (part) {
    leadParts.push(part);
  } else if (influence) {
    leadParts.push(`${influence}好きの音楽仲間`);
  }

  if (recruitingParts.length > 0) {
    leadParts.push(`${recruitingParts.join("・")}を募集`);
  }

  const lead = leadParts.length > 0 ? `${leadParts.join("。")}。` : "";
  const summary = getProfileSummary(member).slice(0, 80);

  return `${lead}RESONOで、音楽性の合うバンド仲間と出会えます。${summary}`.trim();
}

export function buildMemberMetadata(member: Member): Metadata {
  if (!isMemberIndexable(member)) {
    return createPageMetadata({
      title: "プロフィール",
      description: DEFAULT_MEMBER_PRIVATE_DESCRIPTION,
      path: `/member/${member.id}`,
      robots: {
        index: false,
        follow: false,
      },
    });
  }

  return createPageMetadata({
    title: buildMemberSeoTitle(member),
    description: buildMemberSeoDescription(member),
    path: `/member/${member.id}`,
    openGraphType: "profile",
  });
}
