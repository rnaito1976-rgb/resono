import { redirect } from "next/navigation";
import Link from "next/link";
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
    <main className="mx-auto flex min-h-dvh max-w-mobile flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-white/8 bg-background/90 px-5 pb-4 pt-8 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors active:bg-white/10"
              aria-label="ホームに戻る"
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
            <h1 className="text-2xl font-light tracking-tight">メッセージ</h1>
            <p className="mt-1 text-[14px] text-white/45">
              共鳴した人との自然な会話
            </p>
          </div>
        </div>
      </header>

      <ChatList conversations={conversations} />
    </main>
  );
}
