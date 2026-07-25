import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Server-rendered own-card links (no client JS). */
export function PersonCardOwnLinks() {
  const linkClass = cn(buttonVariants({ variant: "outline", size: "default" }), "w-full tracking-wide");

  return (
    <>
      <Link href="/discover" className={linkClass}>
        Discover a Story
      </Link>
      <Link href="/me" className={linkClass}>
        マイページ
      </Link>
    </>
  );
}
