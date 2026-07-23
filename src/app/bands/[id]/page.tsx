import { notFound, redirect } from "next/navigation";
import { BandPageClient } from "@/components/bands/BandPageClient";
import { getBandDetail, getViewerMemberId } from "@/lib/bands/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BandPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BandPage({ params }: BandPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/bands/${id}`);
  }

  const memberId = await getViewerMemberId();
  if (!memberId) {
    redirect("/onboarding");
  }

  const detail = await getBandDetail(id, memberId);
  if (!detail) {
    notFound();
  }

  return <BandPageClient detail={detail} />;
}
