import Script from "next/script";
import { GA_OPT_OUT_STORAGE_KEY } from "@/lib/analytics/exclusion";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-BGFPT8655F";

const shouldLoadAnalytics =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

type GoogleAnalyticsProps = {
  excludeTracking?: boolean;
};

export function GoogleAnalytics({ excludeTracking = false }: GoogleAnalyticsProps) {
  if (!shouldLoadAnalytics || excludeTracking) {
    return null;
  }

  return (
    <>
      <Script id="google-analytics-opt-out" strategy="beforeInteractive">
        {`
          (function () {
            var id = "${GA_MEASUREMENT_ID}";
            var key = "${GA_OPT_OUT_STORAGE_KEY}";
            try {
              var params = new URLSearchParams(window.location.search);
              if (params.get("ga_optout") === "1") {
                localStorage.setItem(key, "1");
              }
              if (params.get("ga_optout") === "0") {
                localStorage.removeItem(key);
              }
              if (localStorage.getItem(key) === "1") {
                window["ga-disable-" + id] = true;
              }
            } catch (e) {}
          })();
        `}
      </Script>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
