import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createNoIndexMetadata("バンド");

export default function BandsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
