import { cn } from "@/lib/utils";

type MenuGroupProps = {
  children: React.ReactNode;
  className?: string;
};

export function MenuGroup({ children, className }: MenuGroupProps) {
  return <div className={cn("space-y-1", className)}>{children}</div>;
}
