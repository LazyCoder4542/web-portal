import { redirect } from "next/navigation";
import Link from "next/link";
import { backend, getAccessToken, authHeaders } from "@/lib/backend";
import type { Profile } from "@/lib/types";
import { ArrowLeft, Calendar } from "lucide-react";

const genderColor: Record<string, string> = {
  male: "bg-blue-50 text-blue-700 border-blue-100",
  female: "bg-purple-50 text-purple-700 border-purple-100",
};
const ageGroupColor: Record<string, string> = {
  child: "bg-yellow-50 text-yellow-700 border-yellow-100",
  teenager: "bg-orange-50 text-orange-700 border-orange-100",
  adult: "bg-green-50 text-green-700 border-green-100",
  senior: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-neutral-50 rounded-xl p-4">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      <p className="text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-neutral-100 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-neutral-600 w-8 text-right">
        {pct}%
      </span>
    </div>
  );
}

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  const { id } = await params;

  let profile: Profile;
  try {
    const { data } = await backend.get<{ status: string } & Profile>(`/profiles/${id}`, {
      headers: authHeaders(token),
    });
    profile = data;
  } catch {
    redirect("/profiles");
  }

  const created = new Date(profile.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-8 py-8 max-w-2xl">
      <Link
        href="/profiles"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Profiles
      </Link>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-7 py-7 border-b border-neutral-100">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">
            {profile.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${genderColor[profile.gender]}`}
            >
              {profile.gender}
            </span>
            <span
              className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${ageGroupColor[profile.age_group]}`}
            >
              {profile.age_group}
            </span>
            <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600">
              {profile.country_name} ({profile.country_id})
            </span>
          </div>
        </div>

        <div className="px-7 py-6 grid grid-cols-2 gap-3 sm:grid-cols-4 border-b border-neutral-100">
          <Stat label="Age" value={`${profile.age} years`} />
          <Stat label="Age group" value={profile.age_group} />
          <Stat label="Country" value={profile.country_name} />
          <Stat label="Country code" value={profile.country_id} />
        </div>

        <div className="px-7 py-6 space-y-4 border-b border-neutral-100">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Prediction confidence
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-neutral-500 mb-1.5">
                Gender — {profile.gender}
              </p>
              <ConfidenceBar value={profile.gender_probability} />
            </div>
            <div>
              <p className="text-xs text-neutral-500 mb-1.5">
                Country — {profile.country_name}
              </p>
              <ConfidenceBar value={profile.country_probability} />
            </div>
          </div>
        </div>

        <div className="px-7 py-4 flex items-center gap-1.5 text-xs text-neutral-400">
          <Calendar size={12} />
          Added {created}
        </div>
      </div>
    </div>
  );
}
