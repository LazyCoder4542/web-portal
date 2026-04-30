import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { backend, getAccessToken, authHeaders } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const response = await backend.get("/profiles/export", {
      headers: authHeaders(token),
      params: { ...params, format: "csv" },
      responseType: "arraybuffer",
    });

    return new Response(response.data as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          (response.headers["content-disposition"] as string) ??
          'attachment; filename="profiles.csv"',
      },
    });
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500;
    return NextResponse.json({ error: "Export failed" }, { status });
  }
}
