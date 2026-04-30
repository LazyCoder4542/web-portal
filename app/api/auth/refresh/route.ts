import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import {
  backend,
  COOKIE_OPTS,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
} from "@/lib/backend";

export async function POST() {
  const store = await cookies();
  const refreshToken = store.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await backend.post<{
      status: string;
      access_token: string;
      refresh_token: string;
    }>("/auth/refresh", { refresh_token: refreshToken });

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
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 401) : 401;
    const response = NextResponse.json({ error: "Refresh failed" }, { status });
    response.cookies.set("access_token", "", { ...COOKIE_OPTS, maxAge: 0 });
    response.cookies.set("refresh_token", "", { ...COOKIE_OPTS, maxAge: 0 });
    return response;
  }
}
