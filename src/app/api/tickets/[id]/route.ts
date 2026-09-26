import { UTApi } from "uploadthing/server";

import { getServerEnv } from "@/lib/config/env";
import { verifyTicketAuditToken } from "@/lib/security/ticket-audit";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const SIGNED_URL_TTL = "5 minutes";

function unavailable(): Response {
  return new Response("Ticket no disponible.", {
    status: 404,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

function inlineFilename(value: string | null): string {
  const sanitized = (value || "ticket.jpg").replace(/["\\\r\n]/g, "_");
  return sanitized || "ticket.jpg";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const participationId = Number(id);
  const token = new URL(request.url).searchParams.get("token") || "";

  if (!Number.isSafeInteger(participationId) || participationId <= 0 || !/^[a-f0-9]{64}$/.test(token)) {
    return unavailable();
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("participations")
    .select("receipt_file_key, receipt_file_name")
    .eq("id", participationId)
    .maybeSingle();

  if (error || !data?.receipt_file_key) return unavailable();

  const env = getServerEnv();
  const reference = { participationId, fileKey: data.receipt_file_key };
  if (!verifyTicketAuditToken(reference, token, env.UPLOAD_INTENT_SECRET)) return unavailable();

  try {
    const uploadThing = new UTApi({ token: env.UPLOADTHING_TOKEN });
    const { ufsUrl } = await uploadThing.generateSignedURL(data.receipt_file_key, {
      expiresIn: SIGNED_URL_TTL,
    });
    const fileResponse = await fetch(ufsUrl, { cache: "no-store" });
    if (!fileResponse.ok || !fileResponse.body) return unavailable();

    return new Response(fileResponse.body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${inlineFilename(data.receipt_file_name)}"`,
        "Content-Type": fileResponse.headers.get("content-type") || "application/octet-stream",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
  } catch (error) {
    console.error("No se pudo abrir el ticket privado", error);
    return unavailable();
  }
}
