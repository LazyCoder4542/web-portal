import { type NextRequest, NextResponse } from "next/server";
import { COOKIE_OPTS } from "@/lib/backend";

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set("access_token", "", { ...COOKIE_OPTS, maxAge: 0 });
  response.cookies.set("refresh_token", "", { ...COOKIE_OPTS, maxAge: 0 });
  return response;
}
