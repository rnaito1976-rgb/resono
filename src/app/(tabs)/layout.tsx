import { getTabViewer } from "@/lib/navigation/require-viewer";
import { getAuthSession } from "@/lib/supabase/auth";

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthSession();

  if (user) {
    await getTabViewer();
  }

  return children;
}
