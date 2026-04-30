import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import {
  backend,
  COOKIE_OPTS,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
} from "@/lib/backend";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  console.log({code})
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const { data } = await backend.get<{
      status: string;
      access_token: string;
      refresh_token: string;
    }>("/auth/github/exchange", { params: { code } });

    const response = NextResponse.json({ status: "success" });
    response.cookies.set("access_token", data.access_token, {
      ...COOKIE_OPTS,
      maxAge: ACCESS_MAX_AGE,
    });
    response.cookies.set("refresh_token", data.refresh_token, {
      ...COOKIE_OPTS,
      maxAge: REFRESH_MAX_AGE,
    });
    return response;
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500;
    return NextResponse.json({ error: "Exchange failed" }, { status });
  }
}
