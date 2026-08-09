"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Loads gtag.js once and fires a page_view on every route change — including
 * client-side navigations, which Next.js's App Router does with History API
 * pushState (no full reload), so plain gtag.js by itself would only ever see
 * the very first page.
 *
 * Renders nothing visible. Does nothing at all if NEXT_PUBLIC_GA_MEASUREMENT_ID
 * isn't set, so it's safe to leave in place for local/dev environments.
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") return;

    // The initial page load's pageview is already sent by the inline
    // `gtag('config', ...)` script below — only report subsequent
    // client-side route changes here to avoid double-counting the first hit.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    window.gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
