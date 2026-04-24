"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type GoogleAnalyticsProps = {
  measurementId: string;
  additionalMeasurementIds?: string[];
};

export function GoogleAnalytics({
  measurementId,
  additionalMeasurementIds = [],
}: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.gtag) {
      return;
    }

    const allMeasurementIds = [measurementId, ...additionalMeasurementIds];
    const queryString = searchParams.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    allMeasurementIds.forEach((id) => {
      window.gtag?.("config", id, {
        page_path: pagePath,
      });
    });
  }, [measurementId, additionalMeasurementIds, pathname, searchParams]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}');
          ${additionalMeasurementIds
            .map((id) => `gtag('config', '${id}');`)
            .join("\n")}
        `}
      </Script>
    </>
  );
}
