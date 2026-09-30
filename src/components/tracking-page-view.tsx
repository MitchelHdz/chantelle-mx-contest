"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

export function TrackingPageView({ metaEnabled, gtmEnabled }: { metaEnabled: boolean; gtmEnabled: boolean }) {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (previousPath.current === null) {
      previousPath.current = pathname;
      return;
    }
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    if (metaEnabled) window.fbq?.("track", "PageView");
    if (gtmEnabled) {
      window.dataLayer?.push({
        event: "virtual_page_view",
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
      });
    }
  }, [gtmEnabled, metaEnabled, pathname]);

  return null;
}
