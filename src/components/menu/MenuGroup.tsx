import { cn } from "@/lib/utils";

type MenuGroupProps = {
  children: React.ReactNode;
  className?: string;
};

export function MenuGroup({ children, className }: MenuGroupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border border-border/80 bg-subtle/80 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function MenuDivider() {
  return <div className="my-3 h-px bg-border/60" aria-hidden />;
}
