"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { scrollHomeToTop } from "@/lib/navigation/home-scroll";

type HomeLogoLinkProps = {
  children: React.ReactNode;
  className?: string;
};

export function HomeLogoLink({ children, className }: HomeLogoLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href="/"
      className={className}
      onClick={(event) => {
        if (pathname === "/") {
          event.preventDefault();
          scrollHomeToTop();
        }
      }}
    >
      {children}
    </Link>
  );
}
