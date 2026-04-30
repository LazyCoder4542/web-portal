import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { backend, getAccessToken, authHeaders } from "@/lib/backend";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { data } = await backend.get(`/profiles/${id}`, {
      headers: authHeaders(token),
    });
    return NextResponse.json(data);
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500;
    return NextResponse.json({ error: "Profile not found" }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await backend.delete(`/profiles/${id}`, {
      headers: authHeaders(token),
    });
    return new Response(null, { status: 204 });
  } catch (err) {
    const status = axios.isAxiosError(err) ? (err.response?.status ?? 500) : 500;
    return NextResponse.json({ error: "Delete failed" }, { status });
  }
}
