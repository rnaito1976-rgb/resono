import { redirect } from "next/navigation";
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
      <header className="px-5 pb-4 pt-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Messages
        </p>
        <h1 className="mt-3 text-[28px] font-light tracking-tight">メッセージ</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-white/45">
          共鳴した人との自然な会話
        </p>
      </header>

      <ChatList conversations={conversations} />
    </main>
  );
}
