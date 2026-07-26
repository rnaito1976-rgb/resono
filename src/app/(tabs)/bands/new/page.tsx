import { redirect } from "next/navigation";
import { CreateBandFlow } from "@/components/bands/CreateBandFlow";
import { getMutualResonateMembers, getViewerMemberId } from "@/lib/bands/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewBandPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/bands/new");
  }

  const memberId = await getViewerMemberId();
  if (!memberId) {
    redirect("/onboarding");
  }

  const mutualMembers = await getMutualResonateMembers(memberId);

  return <CreateBandFlow mutualMembers={mutualMembers} />;
}
