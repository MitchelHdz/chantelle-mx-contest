import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { isMetaConversionsConfigured, sendMetaConversion } from "@/lib/integrations/meta-conversions";
import { assertJsonRequest, assertSameOrigin } from "@/lib/security/request";

export const runtime = "nodejs";

const pageViewSchema = z.object({
  eventId: z.uuid(),
  pageUrl: z.url().max(2048),
});

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    if (!isMetaConversionsConfigured() || request.cookies.get("tracking_opt_out")?.value === "1") {
      return new Response(null, { status: 204 });
    }

    const { eventId, pageUrl } = pageViewSchema.parse(await request.json());
    const sourceUrl = new URL(pageUrl);
    if (sourceUrl.origin !== request.headers.get("origin")) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    sourceUrl.search = "";
    sourceUrl.hash = "";

    const delivered = await sendMetaConversion({ request, name: "PageView", eventId, sourceUrl: sourceUrl.toString() });
    return NextResponse.json({ ok: delivered }, { status: delivered ? 200 : 502 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ ok: false }, { status: 400 });
    if (error instanceof Error && ["MISSING_ORIGIN", "INVALID_ORIGIN"].includes(error.message)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
    if (error instanceof Error && ["INVALID_CONTENT_TYPE", "PAYLOAD_TOO_LARGE"].includes(error.message)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    console.error("No se pudo procesar PageView para Meta", error);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
