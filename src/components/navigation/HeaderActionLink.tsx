import Link from "next/link";
import { cn } from "@/lib/utils";

type HeaderActionLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "primary";
  className?: string;
};

export function HeaderActionLink({
  href,
  children,
  variant = "default",
  className,
}: HeaderActionLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full bg-white/[0.06] px-4 py-2 text-[13px] transition-quiet active:opacity-70",
        variant === "primary" ? "text-primary" : "text-white/75",
        className
      )}
    >
      {children}
    </Link>
  );
}
