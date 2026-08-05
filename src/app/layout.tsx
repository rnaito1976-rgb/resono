import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { FrequencyColorProvider } from "@/components/frequency-color/FrequencyColorProvider";
import { WelcomeRegistrationGate } from "@/components/auth/WelcomeRegistrationGate";
import { TabBarWrapper } from "@/components/navigation/TabBarWrapper";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthUserProvider } from "@/providers/AuthUserProvider";
import { ProfileSheetProvider } from "@/providers/ProfileSheetProvider";
import { getViewerTheme } from "@/lib/members/viewer-theme";
import { getAllCommunityCatalogItemsGrouped } from "@/lib/catalog/queries";
import { getAuthSession } from "@/lib/supabase/auth";
import { getSupabaseUrl } from "@/lib/supabase/env";
import { createPageMetadata, getMetadataBase } from "@/lib/seo/metadata";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  ...createPageMetadata(),
  metadataBase: getMetadataBase(),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#04110B",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [supabaseUrl, viewerColor, user, communityCatalog] = await Promise.all([
    Promise.resolve(getSupabaseUrl()),
    getViewerTheme(),
    getAuthSession(),
    getAllCommunityCatalogItemsGrouped(),
  ]);

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
        <QueryProvider initialCommunityCatalog={communityCatalog}>
          <AuthUserProvider initialUser={user}>
            <FrequencyColorProvider initialColor={viewerColor}>
              <ProfileSheetProvider>
                <WelcomeRegistrationGate />
                <TabBarWrapper>{children}</TabBarWrapper>
              </ProfileSheetProvider>
            </FrequencyColorProvider>
          </AuthUserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
