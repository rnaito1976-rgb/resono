import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  variant?: "welcome" | "form";
};

export function AuthShell({
  children,
  backHref,
  backLabel = "戻る",
  variant = "form",
}: AuthShellProps) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-mobile bg-black">
      {variant === "welcome" ? (
        <div className="flex min-h-dvh flex-col px-6 pb-10 pt-14">{children}</div>
      ) : (
        <div className="flex min-h-dvh flex-col px-6">
          {backHref ? (
            <header className="shrink-0 pt-8">
              <Link
                href={backHref}
                className="inline-flex text-[15px] text-white/60 transition-colors hover:text-white"
              >
                {backLabel}
              </Link>
            </header>
          ) : (
            <div className="pt-8" />
          )}
          <div className="flex-1 overflow-y-auto pb-10 pt-8">{children}</div>
        </div>
      )}
    </div>
  );
}

export function AuthLogo({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-[32px] font-medium tracking-[0.35em] text-white",
        className
      )}
    >
      RESONO
    </p>
  );
}

export function AuthTagline({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "mt-4 text-[15px] font-light tracking-[0.1em] text-white/65",
        className
      )}
    >
      Find your frequency.
    </p>
  );
}
