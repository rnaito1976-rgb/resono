import { notFound } from "next/navigation";
import { ChatRoom } from "@/components/messages/ChatRoom";
import { getMemberById } from "@/lib/members";
import { getConversationById } from "@/lib/messages/conversations";
import { requireViewer } from "@/lib/navigation/require-viewer";
import {
  buildConversationStarters,
  buildResonanceReason,
} from "@/lib/resonance/matching";

export const dynamic = "force-dynamic";

type MessageRoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MessageRoomPage({ params }: MessageRoomPageProps) {
  const { id } = await params;
  const { memberId } = await requireViewer({ loginNext: `/messages/${id}` });

  const [member, conversation] = await Promise.all([
    getMemberById(memberId),
    getConversationById(id, memberId),
  ]);

  if (!member) {
    notFound();
  }

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
