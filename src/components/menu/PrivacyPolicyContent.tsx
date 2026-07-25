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
import { MenuLegalSectionCard } from "@/components/menu/MenuLegalSectionCard";
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

export function PrivacyPolicyContent() {
  return (
    <article className="space-y-5">
      {MENU_PRIVACY.sections.map((section) => (
        <MenuLegalSectionCard
          key={section.id}
          section={section}
          icon={SECTION_ICONS[section.id]}
          iconClassName={SECTION_ICON_COLORS[section.id]}
        />
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
