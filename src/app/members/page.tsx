import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { SeoFooterLinks } from "@/components/seo/SeoFooterLinks";
import { getMembersPage } from "@/lib/members";
import { MEMBERS_SEO } from "@/lib/seo/about-copy";
import { isMemberIndexable } from "@/lib/seo/member";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: MEMBERS_SEO.metadataTitle,
  description: MEMBERS_SEO.metadataDescription,
  path: "/members",
});

function getMemberCardLabel(member: Awaited<ReturnType<typeof getMembersPage>>["members"][number]) {
  const influence = member.portrait.influences.find(Boolean);
  const part = member.music.instruments.find(Boolean) ?? member.lookingFor.parts.find(Boolean);

  if (influence && part) {
    return `${influence}好き · ${part}`;
  }

  if (part) {
    return part;
  }

  if (influence) {
    return `${influence}好き`;
  }

  return "音楽仲間";
}

export default async function MembersPage() {
  const { members } = await getMembersPage(0, 24);
  const indexableMembers = members.filter(isMemberIndexable);

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppPageHeader
        backHref="/"
        backLabel="トップに戻る"
        eyebrow={MEMBERS_SEO.eyebrow}
        title={MEMBERS_SEO.title}
        subtitle={MEMBERS_SEO.lead}
      />

      <div className="space-y-10 px-5 pb-16">
        <section className="space-y-4">
          {MEMBERS_SEO.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="text-[16px] leading-[1.85] text-white/70"
            >
              {paragraph}
            </p>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-[18px] font-medium tracking-tight text-foreground">
            {MEMBERS_SEO.partsHeading}
          </h2>
          <ul className="flex flex-wrap gap-2.5">
            {MEMBERS_SEO.parts.map((part) => (
              <li
                key={part}
                className="rounded-full border border-border/80 bg-subtle/60 px-4 py-2 text-[14px] text-white/70"
              >
                {part}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-[18px] font-medium tracking-tight text-foreground">
            公開中のメンバー
          </h2>

          {indexableMembers.length > 0 ? (
            <ul className="space-y-3">
              {indexableMembers.map((member) => (
                <li key={member.id}>
                  <Link
                    href={`/member/${member.id}`}
                    className="block rounded-[20px] border border-border/80 bg-subtle/60 px-5 py-4 transition-colors hover:border-primary/30"
                  >
                    <p className="text-[16px] font-medium text-foreground">
                      {getMemberCardLabel(member)}
                    </p>
                    {member.lookingFor.parts.length > 0 ? (
                      <p className="mt-2 text-[14px] text-white/55">
                        募集: {member.lookingFor.parts.join(" · ")}
                      </p>
                    ) : null}
                    {member.aiComment ? (
                      <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-white/45">
                        {member.aiComment}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-[18px] border border-border/80 bg-subtle/60 px-5 py-4 text-[15px] text-white/55">
              現在、公開中のメンバー募集は準備中です。
              <Link href="/" className="mt-2 block text-primary">
                トップページから探す
              </Link>
            </p>
          )}
        </section>

        <section className="rounded-[22px] border border-border/80 bg-subtle/60 px-5 py-6">
          <h2 className="text-[18px] font-medium tracking-tight text-foreground">
            RESONOとは
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/60">
            音楽性の合う人と出会い、バンドを始めるためのサービスについて詳しく知る。
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex text-[15px] text-primary transition-colors hover:text-primary/80"
          >
            RESONOについて
          </Link>
        </section>

        <SeoFooterLinks />
      </div>
    </main>
  );
}
