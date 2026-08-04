import Link from "next/link";
import { cn } from "@/lib/utils";

type MenuRowProps = {
  href?: string;
  label: string;
  onClick?: () => void;
  destructive?: boolean;
  accent?: boolean;
  className?: string;
};

export function MenuRow({
  href,
  label,
  onClick,
  destructive = false,
  accent = false,
  className,
}: MenuRowProps) {
  const rowClass = cn(
    "flex w-full items-center px-1 py-[13px] text-left transition-colors active:opacity-70",
    destructive ? "text-red-400" : accent ? "text-primary" : "text-foreground",
    className
  );

  const labelClass = "text-[17px] tracking-tight";

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        <span className={labelClass}>{label}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={rowClass}>
      <span className={labelClass}>{label}</span>
    </button>
  );
}
