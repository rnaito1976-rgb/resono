import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MenuReturnPrefetch } from "@/components/menu/MenuReturnPrefetch";
import { createNoIndexMetadata } from "@/lib/seo/metadata";
import { getAuthSession } from "@/lib/supabase/auth";

export const metadata: Metadata = createNoIndexMetadata("Menu");

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
