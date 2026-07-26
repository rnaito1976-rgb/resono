import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { MENU_ABOUT } from "@/lib/menu/copy";

export default function MenuAboutPage() {
  return (
    <MenuPageShell title="About Resono">
      <article className="space-y-8">
        <div className="rounded-[22px] bg-subtle/70 px-6 py-8">
          <h2 className="text-[22px] font-semibold leading-[1.45] tracking-tight text-foreground">
            {MENU_ABOUT.heading}
          </h2>

          <p className="mt-6 text-[17px] leading-[1.75] text-foreground/70">
            <strong className="font-semibold text-foreground/85">
              {MENU_ABOUT.intro.brand}
            </strong>
            {" は、"}
            <strong className="font-semibold text-foreground/85">
              {MENU_ABOUT.intro.resonate}
            </strong>
            {" を由来とした名前です。"}
          </p>

          <div className="mt-6 space-y-6">
            {MENU_ABOUT.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="whitespace-pre-line text-[17px] leading-[1.75] text-foreground/70"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <p className="mt-8 text-[13px] font-medium tracking-wide text-muted">
            {MENU_ABOUT.version}
          </p>
        </div>
      </article>
    </MenuPageShell>
  );
}
