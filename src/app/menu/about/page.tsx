import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { MENU_ABOUT } from "@/lib/menu/copy";

export default function MenuAboutPage() {
  return (
    <MenuPageShell title="About Resono">
      <article className="space-y-8">
        <div className="rounded-[22px] bg-subtle/70 px-6 py-8">
          <h2 className="whitespace-pre-line text-[22px] font-semibold leading-[1.45] tracking-tight text-foreground">
            {MENU_ABOUT.title}
          </h2>
          <p className="mt-6 whitespace-pre-line text-[17px] leading-[1.75] text-foreground/70">
            {MENU_ABOUT.body}
          </p>
          <p className="mt-8 text-[13px] font-medium tracking-wide text-muted">
            {MENU_ABOUT.version}
          </p>
        </div>

        <p className="px-1 text-[15px] leading-[1.8] text-foreground/55">
          {MENU_ABOUT.footer}
        </p>
      </article>
    </MenuPageShell>
  );
}
