import { redirect } from "next/navigation";
import {
  getBandActivityFeedForMember,
  getBandsForMember,
  getMutualResonateMembers,
} from "@/lib/bands/queries";
import { getMemberById } from "@/lib/members";
import { getOwnMemberActivityFeed } from "@/lib/members/activity-feed";
import { requireViewer } from "@/lib/navigation/require-viewer";
import { MemberDetail } from "@/components/MemberDetail";

export default async function MyPage() {
  const { memberId } = await requireViewer({ loginNext: "/me" });

  const memberPromise = getMemberById(memberId);
  const [member, mutualMembers, memberActivities, memberBands, bandActivities] =
    await Promise.all([
      memberPromise,
      getMutualResonateMembers(memberId),
      memberPromise.then((loaded) =>
        loaded ? getOwnMemberActivityFeed(memberId, 40, loaded) : []
      ),
      getBandsForMember(memberId),
      getBandActivityFeedForMember(memberId),
    ]);

  if (!member) {
    redirect("/welcome");
  }

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetail
        member={member}
        isOwnProfile
        mutualMembers={mutualMembers}
        memberBands={memberBands}
        bandActivities={bandActivities}
        memberActivities={memberActivities}
        priorityPhoto
      />
    </main>
  );
}
