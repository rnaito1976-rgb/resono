import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { MenuScreen } from "@/components/menu/MenuScreen";

export default function MenuPage() {
  return (
    <MenuPageShell backHref="/" backLabel="ホームに戻る" title="Menu">
      <MenuScreen />
    </MenuPageShell>
  );
}
