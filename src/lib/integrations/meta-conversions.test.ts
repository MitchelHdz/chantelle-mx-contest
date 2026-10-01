import type { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { sendMetaConversion } from "./meta-conversions";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function mockRequest(optedOut = false) {
  return {
    headers: new Headers({ "user-agent": "Test Browser", "x-forwarded-for": "192.0.2.1" }),
    cookies: { get: (name: string) => optedOut && name === "tracking_opt_out" ? { value: "1" } : undefined },
  } as unknown as NextRequest;
}

describe("Meta Conversions API delivery", () => {
  it("sends a standard event with its browser event ID using the server token", async () => {
    vi.stubEnv("META_PIXEL_ID", "4495892657318698");
    vi.stubEnv("META_CAPI_ACCESS_TOKEN", "test-server-token");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ events_received: 1 }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const delivered = await sendMetaConversion({
      request: mockRequest(),
      name: "CompleteRegistration",
      eventId: "same-browser-event-id",
      sourceUrl: "https://chantelletellevaaparis.com/",
      email: "test@example.com",
      phone: "55 1234 5678",
    });

    expect(delivered).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://graph.facebook.com/v25.0/4495892657318698/events");
    expect(options.headers).toMatchObject({ Authorization: "Bearer test-server-token" });
    const body = JSON.parse(String(options.body));
    expect(body.data[0]).toMatchObject({ event_name: "CompleteRegistration", event_id: "same-browser-event-id" });
    expect(body.data[0].user_data.em).toMatch(/^[a-f0-9]{64}$/);
    expect(String(options.body)).not.toContain("test@example.com");
  });

  it("does not send events after the visitor opts out", async () => {
    vi.stubEnv("META_PIXEL_ID", "4495892657318698");
    vi.stubEnv("META_CAPI_ACCESS_TOKEN", "test-server-token");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const delivered = await sendMetaConversion({
      request: mockRequest(true),
      name: "PageView",
      eventId: "page-view-id",
      sourceUrl: "https://chantelletellevaaparis.com/",
    });

    expect(delivered).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
