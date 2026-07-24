import { redirect } from "next/navigation";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { ChatList } from "@/components/messages/ChatList";
import { getMemberByUserId } from "@/lib/members";
import { getConversationsForMember } from "@/lib/messages/conversations";
import { isOnboardingComplete } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const member = await getMemberByUserId(user.id);

  if (!member || !isOnboardingComplete(member)) {
    redirect("/onboarding");
  }

  const conversations = await getConversationsForMember(member.id);

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppPageHeader
        eyebrow="Messages"
        title="メッセージ"
        subtitle="共鳴した人との自然な会話"
      />

      <ChatList conversations={conversations} />
    </main>
  );
}
