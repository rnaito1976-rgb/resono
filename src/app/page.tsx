import { Suspense } from "react";
import { HomePageContent, HomePageFallback } from "@/components/home/HomePageContent";

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageContent />
    </Suspense>
  );
}
