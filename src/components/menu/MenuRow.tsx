import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuRowProps = {
  href?: string;
  icon: string;
  label: string;
  onClick?: () => void;
  destructive?: boolean;
  showChevron?: boolean;
  className?: string;
};

export function MenuRow({
  href,
  icon,
  label,
  onClick,
  destructive = false,
  showChevron = true,
  className,
}: MenuRowProps) {
  const content = (
    <>
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center text-[17px]"
        aria-hidden
      >
        {icon}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 text-left text-[17px] tracking-tight",
          destructive ? "text-red-400" : "text-foreground"
        )}
      >
        {label}
      </span>
      {showChevron ? (
        <ChevronRight
          className={cn(
            "h-[18px] w-[18px] shrink-0",
            destructive ? "text-red-400/50" : "text-muted"
          )}
          strokeWidth={2}
          aria-hidden
        />
      ) : null}
    </>
  );

  const rowClass = cn(
    "flex w-full items-center gap-3 px-4 py-[13px] transition-colors active:bg-white/[0.06]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={rowClass}>
      {content}
    </button>
  );
}

export function MenuRowSeparator() {
  return <div className="ml-[52px] h-px bg-border/70" aria-hidden />;
}
