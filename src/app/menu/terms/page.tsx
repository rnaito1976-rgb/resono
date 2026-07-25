import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { TermsOfUseContent } from "@/components/menu/TermsOfUseContent";
import { MENU_TERMS } from "@/lib/menu/copy";

export default function MenuTermsPage() {
  return (
    <MenuPageShell title={MENU_TERMS.title} subtitle={MENU_TERMS.subtitle}>
      <TermsOfUseContent />
    </MenuPageShell>
  );
}
