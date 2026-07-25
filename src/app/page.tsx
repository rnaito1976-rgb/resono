import { HomeBootstrap } from "@/components/home/HomeBootstrap";

export default function HomePage() {
  return (
    <>
      <link
        rel="preload"
        href="/api/home/bootstrap"
        as="fetch"
        crossOrigin="anonymous"
      />
      <HomeBootstrap />
    </>
  );
}
