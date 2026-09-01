import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { createUploadIntent } from "@/lib/data/participations";
import { apiError } from "@/lib/http/response";
import { createUploadIntentToken } from "@/lib/security/crypto";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertJsonRequest, assertSameOrigin, getClientAddress } from "@/lib/security/request";
import { uploadIntentSchema } from "@/lib/validation/participation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    await enforceRateLimit({
      scope: "upload-intent",
      identifier: getClientAddress(request),
      maxRequests: 8,
      windowSeconds: 15 * 60,
    });

    const input = uploadIntentSchema.parse(await request.json());
    const intent = await createUploadIntent(input.ticketNumber, input.store);

    return NextResponse.json({
      ok: true,
      uploadIntent: createUploadIntentToken(intent),
      expiresAt: new Date(intent.expiresAt).toISOString(),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, code: "VALIDATION_ERROR", message: "Revisa el ticket y la tienda." },
        { status: 400 },
      );
    }
    return apiError(error);
  }
}
