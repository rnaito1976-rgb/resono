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
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-20 text-center">
        <p className="text-lg font-light text-white/80">まだ会話はありません</p>
        <p className="mt-3 text-[15px] leading-relaxed text-white/45">
          気になる人に「共鳴する」を送り、
          <br />
          お互いに共鳴したら会話が始まります。
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/6">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/messages/${conversation.id}`}
          className="flex items-center gap-4 px-5 py-4 transition-colors active:bg-white/5"
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/10">
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
