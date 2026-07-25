import Link from "next/link";

type MenuCloseLinkProps = {
  href: string;
};

export function MenuCloseLink({ href }: MenuCloseLinkProps) {
  return (
    <Link
      href={href}
      className="shrink-0 pt-1 text-[17px] font-normal text-primary transition-quiet active:opacity-70"
    >
      Close
    </Link>
  );
}
