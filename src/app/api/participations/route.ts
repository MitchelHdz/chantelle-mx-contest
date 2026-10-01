import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";

import { finalizeParticipation } from "@/lib/data/participations";
import { apiError } from "@/lib/http/response";
import { processGoogleSheetsOutbox } from "@/lib/integrations/google-sheets-outbox";
import { sendMetaConversion } from "@/lib/integrations/meta-conversions";
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
    const eventId = randomUUID();

    after(async () => {
      try {
        await processGoogleSheetsOutbox({ limit: 5 });
      } catch (error) {
        console.error("No se pudo sincronizar Google Sheets después del registro", error);
      }
    });

    if (request.cookies.get("tracking_opt_out")?.value !== "1") {
      after(async () => {
        try {
          await sendMetaConversion({
            request,
            name: "CompleteRegistration",
            eventId,
            sourceUrl: new URL("/", request.nextUrl.origin).toString(),
            email: input.email,
            phone: input.phone,
          });
        } catch {
          console.error("No se pudo enviar CompleteRegistration a Meta Conversions API");
        }
      });
    }

    return NextResponse.json({ ok: true, eventId }, { status: 201 });
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
