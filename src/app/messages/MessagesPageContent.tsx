import { Suspense } from "react";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { ChatList } from "@/components/messages/ChatList";
import { getConversationsForMember } from "@/lib/messages/conversations";
import { requireViewer } from "@/lib/navigation/require-viewer";

function ChatListSkeleton() {
  return (
    <div className="space-y-3 px-5 pb-8">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-2xl border border-border/40 p-4"
        >
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-28 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function MessagesContent() {
  const { memberId } = await requireViewer({ loginNext: "/messages" });
  const conversations = await getConversationsForMember(memberId);
  return <ChatList conversations={conversations} />;
}

export function MessagesPageContent() {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppPageHeader
        backHref="/"
        backLabel="ホームに戻る"
        eyebrow="Messages"
        title="メッセージ"
        subtitle="共鳴した人との自然な会話"
      />
      <Suspense fallback={<ChatListSkeleton />}>
        <MessagesContent />
      </Suspense>
    </main>
  );
}
