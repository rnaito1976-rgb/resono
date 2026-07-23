import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FrequencyColorProvider } from "@/components/frequency-color/FrequencyColorProvider";
import { getViewerFrequencyColor } from "@/lib/frequency-color/server";
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
  const frequencyColor = await getViewerFrequencyColor();

  return (
    <html lang="ja" className="dark">
      <body
        className={`${inter.variable} min-h-dvh bg-background font-sans text-foreground antialiased`}
      >
        <FrequencyColorProvider color={frequencyColor}>
          {children}
        </FrequencyColorProvider>
      </body>
    </html>
  );
}
