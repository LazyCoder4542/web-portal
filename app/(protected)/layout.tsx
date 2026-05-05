import { redirect } from "next/navigation";
import axios from "axios";
import { backend, getAccessToken, authHeaders } from "@/lib/backend";
import Sidebar from "@/components/sidebar";
import type { User } from "@/lib/types";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  let user: User;
  try {
    const { data } = await backend.get<User>("/users/me", {
      headers: authHeaders(token),
    });
    user = data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      redirect("/api/auth/clear");
    }
    throw err;
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1 ml-56 min-h-0">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
