import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type MenuLegalSection = {
  id: string;
  heading: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
  footer?: string;
  feedbackLink?: boolean;
};

type MenuLegalSectionCardProps = {
  section: MenuLegalSection;
  icon: LucideIcon;
  iconClassName: string;
};

export function MenuLegalSectionCard({
  section,
  icon: Icon,
  iconClassName,
}: MenuLegalSectionCardProps) {
  return (
    <section className="rounded-[22px] bg-subtle/70 px-5 py-6">
      <div className="flex items-start gap-4">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${iconClassName}`}
          aria-hidden
        >
          <Icon className="h-[20px] w-[20px]" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1 space-y-4">
          <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
            {section.heading}
          </h2>

          {section.paragraphs?.map((paragraph) => (
            <p
              key={paragraph}
              className="text-[16px] leading-[1.85] text-foreground/70"
            >
              {paragraph}
            </p>
          ))}

          {section.bullets ? (
            <ul className="space-y-2.5">
              {section.bullets.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[16px] leading-[1.75] text-foreground/70"
                >
                  <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {section.footer ? (
            <p className="text-[16px] leading-[1.85] text-foreground/70">{section.footer}</p>
          ) : null}

          {section.feedbackLink ? (
            <p className="text-[16px] leading-[1.85] text-foreground/70">
              ご質問や不安なことがありましたら、
              <Link
                href="/menu/feedback"
                className="text-primary underline-offset-2 hover:underline"
              >
                Feedback
              </Link>
              からお気軽にご連絡ください。
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
