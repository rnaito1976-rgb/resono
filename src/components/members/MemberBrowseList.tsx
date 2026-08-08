import { MemberListCard } from "@/components/members/MemberListCard";
import { MemberListRow } from "@/components/members/MemberListRow";
import type { MembersViewMode } from "@/lib/members/view-mode";
import type { Member } from "@/types/member";

type MemberBrowseListProps = {
  members: Member[];
  viewMode: MembersViewMode;
  cardClassName?: string;
};

export function MemberBrowseList({
  members,
  viewMode,
  cardClassName,
}: MemberBrowseListProps) {
  if (viewMode === "card") {
    return (
      <ul className="grid grid-cols-2 gap-3">
        {members.map((member) => (
          <li key={member.id} className="min-w-0">
            <MemberListCard member={member} layout="grid" className={cardClassName} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <li key={member.id}>
          <MemberListRow member={member} className={cardClassName} />
        </li>
      ))}
    </ul>
  );
}
