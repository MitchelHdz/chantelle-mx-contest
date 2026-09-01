export type AnalyticsEvent =
  | "landing_view"
  | "registration_started"
  | "receipt_upload_started"
  | "receipt_upload_completed"
  | "registration_submitted"
  | "registration_succeeded"
  | "registration_failed"
  | "privacy_opened";

type AnalyticsProperties = Record<string, string | number | boolean | undefined>;

const forbiddenKey = /(name|email|phone|ticket|folio|file|url)/i;

export function sanitizeAnalyticsProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => !forbiddenKey.test(key) && value !== undefined),
  );
}

export function track(event: AnalyticsEvent, properties: AnalyticsProperties = {}): void {
  if (typeof window === "undefined" || window.localStorage.getItem("chantelle_analytics_consent") !== "granted") {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...sanitizeAnalyticsProperties(properties) });
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}
