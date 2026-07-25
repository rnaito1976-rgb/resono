import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { MenuScreen } from "@/components/menu/MenuScreen";

export default function MenuPage() {
  return (
    <MenuPageShell variant="root" title="Menu">
      <MenuScreen />
    </MenuPageShell>
  );
}
