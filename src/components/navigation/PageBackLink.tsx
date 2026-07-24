import Link from "next/link";

type PageBackLinkProps = {
  href: string;
  label?: string;
};

export function PageBackLink({ href, label = "戻る" }: PageBackLinkProps) {
  return (
    <Link
      href={href}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors active:bg-white/10"
      aria-label={label}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}
