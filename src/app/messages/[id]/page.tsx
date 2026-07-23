import { notFound, redirect } from "next/navigation";
import { ChatRoom } from "@/components/messages/ChatRoom";
import { getMemberByUserId } from "@/lib/members";
import { getConversationById } from "@/lib/messages/conversations";
import {
  buildConversationStarters,
  buildResonanceReason,
} from "@/lib/resonance/matching";
import { isOnboardingComplete } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MessageRoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MessageRoomPage({ params }: MessageRoomPageProps) {
  const { id } = await params;
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

  const conversation = await getConversationById(id, member.id);

  if (!conversation) {
    notFound();
  }

  const reason = buildResonanceReason(member, conversation.partner);
  const starters = buildConversationStarters(member, conversation.partner);

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <ChatRoom
        conversationId={conversation.conversation.id}
        currentMemberId={member.id}
        partnerName={conversation.partner.name}
        initialMessages={conversation.messages}
        reason={reason}
        starters={starters}
      />
    </main>
  );
}
