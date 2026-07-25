import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FrequencyColorProvider } from "@/components/frequency-color/FrequencyColorProvider";
import { TabBarWrapper } from "@/components/navigation/TabBarWrapper";
import { QueryProvider } from "@/providers/QueryProvider";
import { ProfileSheetProvider } from "@/providers/ProfileSheetProvider";
import { getViewerContext } from "@/lib/members/viewer-context";
import { getSupabaseUrl } from "@/lib/supabase/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resono",
  description: "世界観で共鳴する仲間と出会う",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { frequencyColor } = await getViewerContext();
  const supabaseUrl = getSupabaseUrl();

  return (
    <html lang="ja" className="dark">
      <head>
        {supabaseUrl ? (
          <>
            <link rel="preconnect" href={supabaseUrl} />
            <link rel="dns-prefetch" href={supabaseUrl} />
          </>
        ) : null}
      </head>
      <body
        className={`${inter.variable} min-h-dvh bg-background font-sans text-foreground antialiased`}
      >
        <QueryProvider>
          <FrequencyColorProvider color={frequencyColor}>
            <ProfileSheetProvider>
              <TabBarWrapper>{children}</TabBarWrapper>
            </ProfileSheetProvider>
          </FrequencyColorProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
