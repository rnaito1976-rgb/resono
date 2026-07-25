import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FrequencyColorProvider } from "@/components/frequency-color/FrequencyColorProvider";
import { ThemeLoader } from "@/components/frequency-color/ThemeLoader";
import { TabBarWrapper } from "@/components/navigation/TabBarWrapper";
import { QueryProvider } from "@/providers/QueryProvider";
import { ProfileSheetProvider } from "@/providers/ProfileSheetProvider";
import { DEFAULT_FREQUENCY_COLOR } from "@/lib/frequency-color/palette";
import { getSupabaseUrl } from "@/lib/supabase/env";
import { BRAND_DESCRIPTION } from "@/lib/branding/copy";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resono",
  description: BRAND_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <FrequencyColorProvider color={DEFAULT_FREQUENCY_COLOR}>
            <ThemeLoader />
            <ProfileSheetProvider>
              <TabBarWrapper>{children}</TabBarWrapper>
            </ProfileSheetProvider>
          </FrequencyColorProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
