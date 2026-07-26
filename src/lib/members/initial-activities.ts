import type { MemberActivityFeedItem } from "@/types/activity";
import type { Member } from "@/types/member";

export type MemberActivityMilestone = {
  id: string;
  title: string;
  occurredAt: string;
};

/** Own-profile Activity feed: newest first (index 0 = newest). */
export const INITIAL_MEMBER_ACTIVITY_TITLES = [
  "共鳴する仲間を探し始めました",
  "Music DNA を作成しました",
  "担当パートを登録しました",
  "好きなアーティストを登録しました",
] as const;

const MILESTONE_INTERVAL_MS = 60_000;

export function buildInitialMemberActivities(
  baseTime: string = new Date().toISOString()
): MemberActivityMilestone[] {
  const base = new Date(baseTime).getTime();

  return INITIAL_MEMBER_ACTIVITY_TITLES.map((title, index) => ({
    id: `initial-${index}`,
    title,
    occurredAt: new Date(base - index * MILESTONE_INTERVAL_MS).toISOString(),
  }));
}

export function attachInitialMemberActivities(member: Member): Member {
  if (member.portrait.activityMilestones?.length) {
    return member;
  }

  return {
    ...member,
    portrait: {
      ...member.portrait,
      activityMilestones: buildInitialMemberActivities(),
    },
  };
}

export function getMemberActivityMilestones(
  member: Member | undefined,
  registeredAt?: string
): MemberActivityMilestone[] {
  if (!member?.portrait.dialogueCompleted) {
    return [];
  }

  if (member.portrait.activityMilestones?.length) {
    return [...member.portrait.activityMilestones].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  return buildInitialMemberActivities(registeredAt ?? new Date().toISOString());
}

export function memberActivityMilestonesToFeedItems(
  milestones: MemberActivityMilestone[]
): MemberActivityFeedItem[] {
  return milestones.map((milestone) => ({
    id: `milestone-${milestone.id}`,
    kind: "profile_milestone",
    occurredAt: milestone.occurredAt,
    title: milestone.title,
  }));
}
