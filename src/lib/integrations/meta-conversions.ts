import "server-only";

import type { NextRequest } from "next/server";

import { buildMetaEvent, type MetaEventName } from "@/lib/integrations/meta-events";
import { getClientAddress } from "@/lib/security/request";

const GRAPH_API_VERSION = "v25.0";

export function isMetaConversionsConfigured() {
  return Boolean(process.env.META_PIXEL_ID?.trim() && process.env.META_CAPI_ACCESS_TOKEN?.trim());
}

export async function sendMetaConversion(input: {
  request: NextRequest;
  name: MetaEventName;
  eventId: string;
  sourceUrl: string;
  email?: string;
  phone?: string;
}) {
  const pixelId = process.env.META_PIXEL_ID?.trim();
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN?.trim();
  if (!pixelId || !accessToken || input.request.cookies.get("tracking_opt_out")?.value === "1") return false;

  const event = buildMetaEvent({
    name: input.name,
    eventId: input.eventId,
    sourceUrl: input.sourceUrl,
    userAgent: input.request.headers.get("user-agent"),
    clientIp: getClientAddress(input.request),
    fbp: input.request.cookies.get("_fbp")?.value,
    fbc: input.request.cookies.get("_fbc")?.value,
    email: input.email,
    phone: input.phone,
  });

  const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [event],
      ...(process.env.META_TEST_EVENT_CODE?.trim() ? { test_event_code: process.env.META_TEST_EVENT_CODE.trim() } : {}),
    }),
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    console.error("Meta Conversions API rechazó el evento", { event: input.name, status: response.status });
    return false;
  }

  const result = (await response.json()) as { events_received?: number };
  if (result.events_received !== 1) {
    console.error("Meta Conversions API no confirmó el evento", { event: input.name, eventsReceived: result.events_received });
    return false;
  }
  return true;
}
