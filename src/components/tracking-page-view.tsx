"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

export function TrackingPageView({ metaEnabled, capiEnabled, gtmEnabled }: { metaEnabled: boolean; capiEnabled: boolean; gtmEnabled: boolean }) {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    const isInitialView = previousPath.current === null;
    previousPath.current = pathname;

    if (metaEnabled) {
      const eventId = crypto.randomUUID();
      window.fbq?.("track", "PageView", {}, { eventID: eventId });
      if (capiEnabled) {
        void fetch("/api/meta/page-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, pageUrl: window.location.href }),
          keepalive: true,
        }).catch(() => undefined);
      }
    }
    if (gtmEnabled && !isInitialView) {
      window.dataLayer?.push({
        event: "virtual_page_view",
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
      });
    }
  }, [capiEnabled, gtmEnabled, metaEnabled, pathname]);

  return null;
}
