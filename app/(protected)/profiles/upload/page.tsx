import { redirect } from "next/navigation";
import axios from "axios";
import { backend, getAccessToken, authHeaders } from "@/lib/backend";
import type { User } from "@/lib/types";
import UploadClient from "./upload-client";

export default async function UploadPage() {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  let user: User;
  try {
    const { data } = await backend.get<User>("/users/me", { headers: authHeaders(token) });
    user = data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      redirect("/api/auth/clear");
    }
    throw err;
  }

  if (user.role !== "admin") redirect("/profiles");

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-neutral-900">Upload profiles</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Bulk-import profiles from a CSV file. Bad rows are skipped automatically.
        </p>
      </div>
      <UploadClient />
    </div>
  );
}
