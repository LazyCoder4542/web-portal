import { NextResponse } from "next/server";
import axios from "axios";
import { backend, COOKIE_OPTS, getAccessToken, authHeaders } from "@/lib/backend";

export async function POST() {
  const token = await getAccessToken();

  if (token) {
    try {
      await backend.post("/auth/logout", {}, { headers: authHeaders(token) });
    } catch (err) {
      if (!axios.isAxiosError(err)) throw err;
      // Clear cookies regardless of backend response
    }
  }

  const response = NextResponse.json({ status: "success" });
  response.cookies.set("access_token", "", { ...COOKIE_OPTS, maxAge: 0 });
  response.cookies.set("refresh_token", "", { ...COOKIE_OPTS, maxAge: 0 });
  return response;
}
