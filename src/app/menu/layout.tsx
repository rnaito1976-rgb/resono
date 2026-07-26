import { MenuReturnPrefetch } from "@/components/menu/MenuReturnPrefetch";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MenuReturnPrefetch />
      {children}
    </>
  );
}
