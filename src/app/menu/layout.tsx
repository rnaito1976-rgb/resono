import { redirect } from "next/navigation";
import { MenuReturnPrefetch } from "@/components/menu/MenuReturnPrefetch";
import { getAuthSession } from "@/lib/supabase/auth";

export default async function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthSession();

  if (!user) {
    redirect("/login?next=/menu");
  }

  return (
    <>
      <MenuReturnPrefetch />
      {children}
    </>
  );
}
