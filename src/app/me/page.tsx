import { redirect } from "next/navigation";
import { getMutualResonateMembers } from "@/lib/bands/queries";
import { getMemberById } from "@/lib/members";
import { getOwnMemberActivityFeed } from "@/lib/members/activity-feed";
import { requireViewer } from "@/lib/navigation/require-viewer";
import { MemberDetail } from "@/components/MemberDetail";

export default async function MyPage() {
  const { memberId } = await requireViewer({ loginNext: "/me" });

  const [member, mutualMembers] = await Promise.all([
    getMemberById(memberId),
    getMutualResonateMembers(memberId),
  ]);

  if (!member) {
    redirect("/onboarding");
  }

  const memberActivities = await getOwnMemberActivityFeed(memberId, 40, member.name);

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetail
        member={member}
        isOwnProfile
        mutualMembers={mutualMembers}
        memberActivities={memberActivities}
        priorityPhoto
      />
    </main>
  );
}
