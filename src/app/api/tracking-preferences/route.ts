import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return new Response(null, { status: 403 });
  }

  const form = await request.formData();
  const choice = form.get("tracking");
  if (choice !== "off" && choice !== "on") {
    return new Response(null, { status: 400 });
  }

  const response = NextResponse.redirect(new URL("/privacidad", request.url), { status: 303 });
  if (choice === "off") {
    response.cookies.set("tracking_opt_out", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } else {
    response.cookies.delete("tracking_opt_out");
  }
  return response;
}
