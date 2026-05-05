import { type NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/backend";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const backendForm = new FormData();
  backendForm.append("file", file);

  try {
    const res = await fetch(`${process.env.BACKEND_URL}/profiles/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-Version": "1",
      },
      body: backendForm,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
