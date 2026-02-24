"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    WOW?: any;
    jQuery?: any;
    $?: any;
  }
}

export function TemplateScripts() {
  useEffect(() => {
    const tryInit = () => {
      if (typeof window !== "undefined" && window.WOW) {
        try {
          new window.WOW({ live: false }).init();
        } catch {}
      }
    };

    tryInit();
    const t1 = setTimeout(tryInit, 300);
    const t2 = setTimeout(tryInit, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <>
      <Script src="/assets/js/jquery.min.js" strategy="beforeInteractive" />

      <Script src="/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />

      <Script src="/assets/js/modernizr.custom.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery.pointparallax.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/jquery-plugin-collection.js" strategy="afterInteractive" />
      <Script src="/assets/js/moving-animation.js" strategy="afterInteractive" />
      <Script src="/assets/js/tilt.jquery.min.js" strategy="afterInteractive" />

      <Script
        src="/assets/js/script.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.WOW) {
            try {
              new window.WOW({ live: false }).init();
            } catch {}
          }
        }}
      />
    </>
  );
}