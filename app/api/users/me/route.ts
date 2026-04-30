import { NextResponse } from "next/server";
import axios from "axios";
import { backend, getAccessToken, authHeaders } from "@/lib/backend";

export async function GET() {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data } = await backend.get("/users/me", {
      headers: authHeaders(token),
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500;
    return NextResponse.json({ error: "Failed to get user" }, { status });
  }
}
