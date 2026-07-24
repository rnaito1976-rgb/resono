"use client";

import Image from "next/image";
import Link from "next/link";
import type { ConversationSummary } from "@/lib/messages/types";
import { formatConversationTime } from "@/components/messages/MessageBubble";

type ChatListProps = {
  conversations: ConversationSummary[];
};

export function ChatList({ conversations }: ChatListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
        <div className="mb-10 flex h-40 w-40 items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.03]">
          <div className="relative h-24 w-24">
            <span className="absolute left-4 top-5 h-10 w-10 rounded-full bg-primary/20" />
            <span className="absolute right-3 top-7 h-8 w-8 rounded-full bg-white/10" />
            <span className="absolute bottom-4 left-7 h-12 w-12 rounded-[18px] border border-white/10 bg-subtle" />
          </div>
        </div>
        <h2 className="text-[28px] font-light tracking-tight text-foreground">
          まだ会話はありません
        </h2>
        <p className="mt-4 max-w-[26ch] text-[15px] leading-relaxed text-white/45">
          気になる人に「共鳴する」を送り、
          <br />
          お互いに共鳴したら会話が始まります。
        </p>
        <Link
          href="/"
          className="mt-10 flex h-12 min-w-[180px] items-center justify-center rounded-full bg-primary px-8 text-[15px] font-medium text-primary-foreground transition-quiet active:opacity-85"
        >
          Homeへ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-5 pb-8">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/messages/${conversation.id}`}
          className="flex items-center gap-4 rounded-[28px] border border-white/10 bg-subtle px-5 py-4 transition-quiet active:opacity-85"
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
            <Image
              src={conversation.partner.photo}
              alt={conversation.partner.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-[17px] font-medium">
                {conversation.partner.name}
              </p>
              <span className="shrink-0 text-[12px] tabular-nums text-white/35">
                {formatConversationTime(conversation.updatedAt)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="truncate text-[15px] text-white/45">
                {conversation.lastMessage?.body ?? "会話が始まりました"}
              </p>
              {conversation.unreadCount > 0 ? (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
