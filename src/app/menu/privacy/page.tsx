import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { MENU_PRIVACY } from "@/lib/menu/copy";

export default function MenuPrivacyPage() {
  return (
    <MenuPageShell title={MENU_PRIVACY.title}>
      <article className="space-y-8">
        <p className="text-[13px] text-muted">{MENU_PRIVACY.updated}</p>

        {MENU_PRIVACY.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
              {section.heading}
            </h2>
            <p className="text-[16px] leading-[1.8] text-foreground/65">{section.body}</p>
          </section>
        ))}
      </article>
    </MenuPageShell>
  );
}
