type MessageBubbleProps = {
  body: string;
  isOwn: boolean;
  time: string;
};

export function MessageBubble({ body, isOwn, time }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-[22px] px-4 py-2.5 text-[16px] leading-relaxed ${
            isOwn
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-white/10 text-white"
          }`}
        >
          {body}
        </div>
        <span className="px-1 text-[11px] tabular-nums text-white/35">{time}</span>
      </div>
    </div>
  );
}

function formatMessageTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMessageTimestamp(iso: string) {
  return formatMessageTime(iso);
}

export function formatConversationTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return formatMessageTime(iso);
  }

  return date.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}
