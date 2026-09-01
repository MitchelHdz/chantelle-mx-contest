import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { finalizeParticipation } from "@/lib/data/participations";
import { apiError } from "@/lib/http/response";
import { verifyUploadIntentToken } from "@/lib/security/crypto";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { assertJsonRequest, assertSameOrigin, getClientAddress } from "@/lib/security/request";
import { participationSchema } from "@/lib/validation/participation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    assertJsonRequest(request);
    await enforceRateLimit({
      scope: "participation",
      identifier: getClientAddress(request),
      maxRequests: 5,
      windowSeconds: 30 * 60,
    });

    const input = participationSchema.parse(await request.json());
    const intent = verifyUploadIntentToken(input.uploadIntent);

    const result = await finalizeParticipation(input, intent);

    return NextResponse.json({ ok: true, folio: result.folio }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, code: "VALIDATION_ERROR", message: "Revisa los campos marcados.", fields: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return apiError(error);
  }
}
