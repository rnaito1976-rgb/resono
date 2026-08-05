import type { Metadata } from "next";
import { createNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createNoIndexMetadata("メッセージ");

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
