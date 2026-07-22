import { LogoutButton } from "@/components/auth/LogoutButton";
import { PersonCard } from "@/components/PersonCard";
import { getMembers } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const [members, supabase] = await Promise.all([getMembers(), createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <header className="sticky top-0 z-10 bg-background/80 px-6 pb-4 pt-8 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium tracking-[0.35em] text-white">RESONO</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              世界観で共鳴するバンドメンバーと出会う
            </p>
          </div>
          {user ? <LogoutButton /> : null}
        </div>
      </header>

      <div className="flex flex-col gap-10 px-5 pb-16 pt-4">
        {members.map((member) => (
          <PersonCard key={member.id} member={member} />
        ))}
      </div>
    </main>
  );
}
