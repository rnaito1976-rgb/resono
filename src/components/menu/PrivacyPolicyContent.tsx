import Link from "next/link";
import {
  Cloud,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { MENU_PRIVACY } from "@/lib/menu/copy";

const SECTION_ICONS: Record<(typeof MENU_PRIVACY.sections)[number]["id"], LucideIcon> = {
  info: UserRound,
  privacy: Shield,
  ai: Sparkles,
  services: Cloud,
  promise: Heart,
  contact: MessageCircle,
};

const SECTION_ICON_COLORS: Record<
  (typeof MENU_PRIVACY.sections)[number]["id"],
  string
> = {
  info: "bg-blue-500/15 text-blue-300",
  privacy: "bg-emerald-500/15 text-emerald-300",
  ai: "bg-violet-500/15 text-violet-300",
  services: "bg-sky-500/15 text-sky-300",
  promise: "bg-rose-500/15 text-rose-300",
  contact: "bg-amber-500/15 text-amber-300",
};

type PrivacySection = (typeof MENU_PRIVACY.sections)[number];

function PrivacySectionCard({ section }: { section: PrivacySection }) {
  const Icon = SECTION_ICONS[section.id];
  const iconColor = SECTION_ICON_COLORS[section.id];

  return (
    <section className="rounded-[22px] bg-subtle/70 px-5 py-6">
      <div className="flex items-start gap-4">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${iconColor}`}
          aria-hidden
        >
          <Icon className="h-[20px] w-[20px]" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1 space-y-4">
          <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
            {section.heading}
          </h2>

          {"paragraphs" in section && section.paragraphs
            ? section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[16px] leading-[1.85] text-foreground/70"
                >
                  {paragraph}
                </p>
              ))
            : null}

          {"bullets" in section && section.bullets ? (
            <ul className="space-y-2.5">
              {section.bullets.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[16px] leading-[1.75] text-foreground/70"
                >
                  <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {"footer" in section && section.footer ? (
            <p className="text-[16px] leading-[1.85] text-foreground/70">{section.footer}</p>
          ) : null}

          {"feedbackLink" in section && section.feedbackLink ? (
            <p className="text-[16px] leading-[1.85] text-foreground/70">
              ご質問や不安なことがありましたら、
              <Link
                href="/menu/feedback"
                className="text-primary underline-offset-2 hover:underline"
              >
                Feedback
              </Link>
              からお気軽にご連絡ください。
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function PrivacyPolicyContent() {
  return (
    <article className="space-y-5">
      {MENU_PRIVACY.sections.map((section) => (
        <PrivacySectionCard key={section.id} section={section} />
      ))}

      <footer className="space-y-1 px-1 pt-6 text-center">
        <p className="text-[13px] font-medium tracking-wide text-muted">
          {MENU_PRIVACY.version}
        </p>
        <p className="text-[13px] text-muted/80">{MENU_PRIVACY.lastUpdated}</p>
      </footer>
    </article>
  );
}
