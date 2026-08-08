import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Server-rendered own-card links (no client JS). */
export function PersonCardOwnLinks() {
  const linkClass = cn(buttonVariants({ variant: "outline", size: "default" }), "w-full tracking-wide");

  return (
    <>
      <Link href="/discover" className={linkClass}>
        プロフィールを育てる
      </Link>
      <Link href="/me" className={linkClass}>
        もっと知る
      </Link>
    </>
  );
}
