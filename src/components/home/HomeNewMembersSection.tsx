"use client";

import { MemberBrowseList } from "@/components/members/MemberBrowseList";
import { useMembersViewModeOptional } from "@/components/members/MembersViewProvider";
import type { Member } from "@/types/member";

type HomeNewMembersSectionProps = {
  members: Member[];
  title?: string;
  description?: string;
};

export function HomeNewMembersSection({
  members,
  title = "今日登録した人",
  description,
}: HomeNewMembersSectionProps) {
  const viewContext = useMembersViewModeOptional();
  const viewMode = viewContext?.viewMode ?? "card";

  if (members.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          New
        </p>
        <h2 className="mt-2 text-[22px] font-light tracking-tight text-white">{title}</h2>
        {description ? (
          <p className="mt-2 text-[14px] leading-relaxed text-white/45">{description}</p>
        ) : null}
      </div>

      <MemberBrowseList members={members} viewMode={viewMode} />
    </section>
  );
}
