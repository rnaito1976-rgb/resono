import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { PrivacyPolicyContent } from "@/components/menu/PrivacyPolicyContent";
import { MENU_PRIVACY } from "@/lib/menu/copy";

export default function MenuPrivacyPage() {
  return (
    <MenuPageShell
      title={MENU_PRIVACY.title}
      subtitle={MENU_PRIVACY.subtitle}
    >
      <PrivacyPolicyContent />
    </MenuPageShell>
  );
}
