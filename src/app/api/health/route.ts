import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    { ok: true, service: "chantelle-rifa", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
