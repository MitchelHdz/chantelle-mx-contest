import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { ZodError } from "zod";

import { finalizeParticipation } from "@/lib/data/participations";
import { apiError } from "@/lib/http/response";
import { processGoogleSheetsOutbox } from "@/lib/integrations/google-sheets-outbox";
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

    await finalizeParticipation(input, intent);

    after(async () => {
      try {
        await processGoogleSheetsOutbox({ limit: 5 });
      } catch (error) {
        console.error("No se pudo sincronizar Google Sheets después del registro", error);
      }
    });

    return NextResponse.json({ ok: true }, { status: 201 });
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
