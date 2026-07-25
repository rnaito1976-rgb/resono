import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { MenuScreen } from "@/components/menu/MenuScreen";

export default function MenuPage() {
  return (
    <MenuPageShell closeHref="/" title="Menu">
      <MenuScreen />
    </MenuPageShell>
  );
}
