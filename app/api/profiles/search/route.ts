import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { backend, getAccessToken, authHeaders } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const { data } = await backend.get("/profiles/search", {
      headers: authHeaders(token),
      params,
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500;
    return NextResponse.json({ error: "Search failed" }, { status });
  }
}
