import { MenuLegalSectionBlock } from "@/components/menu/MenuLegalSectionCard";
import { MENU_PRIVACY } from "@/lib/menu/copy";

export function PrivacyPolicyContent() {
  return (
    <article className="space-y-10">
      {MENU_PRIVACY.sections.map((section) => (
        <MenuLegalSectionBlock key={section.id} section={section} />
      ))}

      <footer className="space-y-1 pt-4 text-center">
        <p className="text-[13px] font-medium tracking-wide text-muted">
          {MENU_PRIVACY.version}
        </p>
        <p className="text-[13px] text-muted/80">{MENU_PRIVACY.lastUpdated}</p>
      </footer>
    </article>
  );
}
