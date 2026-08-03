import { redirect } from "next/navigation";
import {
  getBandActivityFeedForMember,
  getBandsForMember,
  getMutualResonateMembers,
} from "@/lib/bands/queries";
import { getMemberById } from "@/lib/members";
import { getOwnMemberActivityFeed } from "@/lib/members/activity-feed";
import { getRecruitmentApplicantsByPart } from "@/lib/recruitment/applications";
import { requireViewer } from "@/lib/navigation/require-viewer";
import { MemberDetail } from "@/components/MemberDetail";

export default async function MyPage() {
  const { memberId } = await requireViewer({ loginNext: "/me" });

  const memberPromise = getMemberById(memberId);
  const [member, mutualMembers, memberActivities, memberBands, bandActivities, recruitmentApplicants] =
    await Promise.all([
      memberPromise,
      getMutualResonateMembers(memberId),
      memberPromise.then((loaded) =>
        loaded ? getOwnMemberActivityFeed(memberId, 40, loaded) : []
      ),
      getBandsForMember(memberId),
      getBandActivityFeedForMember(memberId),
      memberPromise.then((loaded) =>
        loaded?.lookingFor?.parts?.some(Boolean)
          ? getRecruitmentApplicantsByPart(memberId)
          : []
      ),
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
        recruitmentApplicants={recruitmentApplicants}
        priorityPhoto
      />
    </main>
  );
}
