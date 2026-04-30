import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { backend, getAccessToken, authHeaders } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const { data } = await backend.get("/profiles", {
      headers: authHeaders(token),
      params,
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500;
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status });
  }
}

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { data, status } = await backend.post("/profiles", body, {
      headers: authHeaders(token),
    });
    return NextResponse.json(data, { status });
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500;
    return NextResponse.json({ error: "Failed to create profile" }, { status });
  }
}
