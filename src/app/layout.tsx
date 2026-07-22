import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resono",
  description: "世界観で共鳴するバンドメンバーと出会う",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body
        className={`${inter.variable} min-h-dvh bg-black font-sans text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
