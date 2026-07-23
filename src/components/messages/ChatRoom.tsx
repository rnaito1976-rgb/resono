"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";
import { createClient } from "@/lib/supabase/client";
import {
  markConversationReadAction,
  sendMessageAction,
} from "@/lib/actions/messages";
import { dispatchMessagesChange } from "@/lib/messages/events";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { MessageRow } from "@/lib/messages/types";
import { ConversationStarters } from "@/components/messages/ConversationStarters";
import {
  MessageBubble,
  formatMessageTimestamp,
} from "@/components/messages/MessageBubble";
import { ResonanceReasonHeader } from "@/components/ResonanceReasonBullets";

type ChatRoomProps = {
  conversationId: string;
  currentMemberId: string;
  partnerName: string;
  initialMessages: MessageRow[];
  reason: ResonanceReason;
  starters: string[];
};

export function ChatRoom({
  conversationId,
  currentMemberId,
  partnerName,
  initialMessages,
  reason,
  starters,
}: ChatRoomProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom("auto");
  }, [scrollToBottom]);

  useEffect(() => {
    markConversationReadAction(conversationId).then(() => {
      dispatchMessagesChange();
    });
  }, [conversationId]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new as MessageRow;
          setMessages((current) => {
            if (current.some((item) => item.id === message.id)) {
              return current;
            }
            return [...current, message];
          });

          if (message.sender_member_id !== currentMemberId) {
            markConversationReadAction(conversationId).then(() => {
              dispatchMessagesChange();
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentMemberId, supabase]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    (body: string) => {
      const trimmed = body.trim();
      if (!trimmed || isPending) {
        return;
      }

      setDraft("");

      startTransition(async () => {
        const result = await sendMessageAction(conversationId, trimmed);

        if (result.error) {
          setDraft(trimmed);
          return;
        }

        if (result.message) {
          setMessages((current) => {
            if (current.some((item) => item.id === result.message!.id)) {
              return current;
            }
            return [...current, result.message!];
          });
        }

        dispatchMessagesChange();
      });
    },
    [conversationId, isPending]
  );

  const showStarters = messages.length === 0;

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-white/8 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href="/messages"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors active:bg-white/10"
            aria-label="戻る"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-[15px] font-medium text-white/90">{partnerName}</h1>
          <div className="h-10 w-10" />
        </div>
      </header>

      <ResonanceReasonHeader reason={reason} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              body={message.body}
              isOwn={message.sender_member_id === currentMemberId}
              time={formatMessageTimestamp(message.created_at)}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-white/8 bg-background pb-8 pt-3">
        {showStarters ? (
          <ConversationStarters
            starters={starters}
            onSelect={sendMessage}
            disabled={isPending}
          />
        ) : null}

        <form
          className="flex items-end gap-3 px-4"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage(draft);
          }}
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={1}
            placeholder="メッセージ"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3 text-[16px] leading-relaxed text-white outline-none placeholder:text-white/35 focus:border-white/20"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage(draft);
              }
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isPending}
            aria-label="送信"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-35"
          >
            {isPending ? (
              <FrequencySpinner size={18} />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
