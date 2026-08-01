import { redirect } from "next/navigation";
import { getMemberById } from "@/lib/members";
import { getOwnMemberActivityFeed } from "@/lib/members/activity-feed";
import { requireViewer } from "@/lib/navigation/require-viewer";
import { MemberDetail } from "@/components/MemberDetail";

export default async function MyPage() {
  const { memberId } = await requireViewer({ loginNext: "/me" });

  const member = await getMemberById(memberId);
  if (!member) {
    redirect("/onboarding");
  }

  const memberActivities = await getOwnMemberActivityFeed(memberId, 40, member);

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetail
        member={member}
        isOwnProfile
        memberActivities={memberActivities}
        lazyLoadBandData
        priorityPhoto
      />
    </main>
  );
}
