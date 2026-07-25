import { redirect } from "next/navigation";
import { getBandActivityFeedForMember, getMutualResonateMembers } from "@/lib/bands/queries";
import { getMemberById } from "@/lib/members";
import { requireViewer } from "@/lib/navigation/require-viewer";
import { MemberDetail } from "@/components/MemberDetail";

export default async function MyPage() {
  const { memberId } = await requireViewer({ loginNext: "/me" });
  const member = await getMemberById(memberId);

  if (!member) {
    redirect("/onboarding");
  }

  const [mutualMembers, bandActivities] = await Promise.all([
    getMutualResonateMembers(memberId),
    getBandActivityFeedForMember(memberId),
  ]);

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetail
        member={member}
        isOwnProfile
        mutualMembers={mutualMembers}
        bandActivities={bandActivities}
        priorityPhoto
      />
    </main>
  );
}
