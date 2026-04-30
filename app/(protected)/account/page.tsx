import { redirect } from "next/navigation";
import { backend, getAccessToken, authHeaders } from "@/lib/backend";
import type { User } from "@/lib/types";
import { Calendar, Mail, ShieldCheck } from "lucide-react";

function GithubIcon({ size = 15, className }: { size?: number; className?: string }) {
  return <img src="/github.svg" width={size} height={size} className={className} alt="" />;
}
import LogoutButton from "./logout-button";

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-4 border-b border-neutral-100 last:border-0">
      <Icon size={15} className="text-neutral-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-neutral-400 mb-0.5">{label}</p>
        <p className="text-sm text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

export default async function AccountPage() {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  let user: User;
  try {
    const { data } = await backend.get<User>("/users/me", {
      headers: authHeaders(token),
    });
    user = data;
  } catch {
    redirect("/login");
  }

  const joined = new Date(user.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-8 py-8 max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Account</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Your profile and settings.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-7 py-7 flex items-center gap-5 border-b border-neutral-100">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-neutral-200 flex items-center justify-center text-xl font-semibold text-neutral-600">
              {user.username[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {user.username}
            </h2>
            <span
              className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                user.role === "admin"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              <ShieldCheck size={11} />
              {user.role}
            </span>
          </div>
        </div>

        <div className="px-7">
          <Field icon={GithubIcon} label="GitHub ID" value={user.github_id} />
          <Field icon={Mail} label="Email" value={user.email} />
          <Field
            icon={ShieldCheck}
            label="Status"
            value={user.is_active ? "Active" : "Inactive"}
          />
          <Field icon={Calendar} label="Joined" value={joined} />
        </div>

        <div className="px-7 py-5 bg-neutral-50 border-t border-neutral-100">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
