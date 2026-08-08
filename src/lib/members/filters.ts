import { getMemberActivityStyles, type ActivityStyleId } from "@/lib/music/activity-style";
import type { Member } from "@/types/member";

export type MembersFilterState = {
  part: string | null;
  activityStyle: ActivityStyleId | null;
};

export const EMPTY_MEMBERS_FILTER: MembersFilterState = {
  part: null,
  activityStyle: null,
};

/** Match by playing part or recruitment part — recruiting is not required. */
export function memberMatchesPartFilter(member: Member, part: string): boolean {
  return (
    member.music.instruments.includes(part) || member.lookingFor.parts.includes(part)
  );
}

export function memberMatchesMembersFilter(
  member: Member,
  filter: MembersFilterState
): boolean {
  if (filter.part && !memberMatchesPartFilter(member, filter.part)) {
    return false;
  }

  if (
    filter.activityStyle &&
    !getMemberActivityStyles(member.music).includes(filter.activityStyle)
  ) {
    return false;
  }

  return true;
}

export function hasMembersFilter(filter: MembersFilterState): boolean {
  return Boolean(filter.part || filter.activityStyle);
}
