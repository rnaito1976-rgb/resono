import {
  Heart,
  Info,
  MessageCircle,
  Music2,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { MenuLegalSectionCard } from "@/components/menu/MenuLegalSectionCard";
import { MENU_TERMS } from "@/lib/menu/copy";

const SECTION_ICONS: Record<(typeof MENU_TERMS.sections)[number]["id"], LucideIcon> = {
  about: Music2,
  guidelines: ShieldCheck,
  posts: Sparkles,
  messages: MessageCircle,
  account: UserRound,
  service: Settings2,
  disclaimer: Info,
  vision: Heart,
};

const SECTION_ICON_COLORS: Record<
  (typeof MENU_TERMS.sections)[number]["id"],
  string
> = {
  about: "bg-violet-500/15 text-violet-300",
  guidelines: "bg-rose-500/15 text-rose-300",
  posts: "bg-blue-500/15 text-blue-300",
  messages: "bg-emerald-500/15 text-emerald-300",
  account: "bg-amber-500/15 text-amber-300",
  service: "bg-sky-500/15 text-sky-300",
  disclaimer: "bg-zinc-500/15 text-zinc-300",
  vision: "bg-fuchsia-500/15 text-fuchsia-300",
};

export function TermsOfUseContent() {
  return (
    <article className="space-y-5">
      {MENU_TERMS.sections.map((section) => (
        <MenuLegalSectionCard
          key={section.id}
          section={section}
          icon={SECTION_ICONS[section.id]}
          iconClassName={SECTION_ICON_COLORS[section.id]}
        />
      ))}

      <footer className="space-y-1 px-1 pt-6 text-center">
        <p className="text-[13px] font-medium tracking-wide text-muted">
          {MENU_TERMS.version}
        </p>
        <p className="text-[13px] text-muted/80">{MENU_TERMS.lastUpdated}</p>
      </footer>
    </article>
  );
}
