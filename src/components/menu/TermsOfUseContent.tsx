import { MenuLegalSectionBlock } from "@/components/menu/MenuLegalSectionCard";
import { MENU_TERMS } from "@/lib/menu/copy";

export function TermsOfUseContent() {
  return (
    <article className="space-y-10">
      {MENU_TERMS.sections.map((section) => (
        <MenuLegalSectionBlock key={section.id} section={section} />
      ))}

      <footer className="space-y-1 pt-4 text-center">
        <p className="text-[13px] font-medium tracking-wide text-muted">
          {MENU_TERMS.version}
        </p>
        <p className="text-[13px] text-muted/80">{MENU_TERMS.lastUpdated}</p>
      </footer>
    </article>
  );
}
