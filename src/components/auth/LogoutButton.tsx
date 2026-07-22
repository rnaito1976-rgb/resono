import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className={cn("h-9 px-3 text-[13px] text-white/60 hover:text-white", className)}
      >
        ログアウト
      </Button>
    </form>
  );
}
