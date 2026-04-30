import { redirect } from "next/navigation";
import { backend, getAccessToken, authHeaders } from "@/lib/backend";
import type { Profile, User, PaginatedResponse } from "@/lib/types";
import { Users, TrendingUp, Globe, Calendar } from "lucide-react";

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ageGroupColor: Record<string, string> = {
  child: "bg-yellow-50 text-yellow-700",
  teenager: "bg-orange-50 text-orange-700",
  adult: "bg-green-50 text-green-700",
  senior: "bg-neutral-100 text-neutral-600",
};

const genderColor: Record<string, string> = {
  male: "bg-blue-50 text-blue-700",
  female: "bg-purple-50 text-purple-700",
};

export default async function DashboardPage() {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  let profiles: Profile[] = [];
  let user: User | null = null;

  try {
    const [profilesRes, userRes] = await Promise.all([
      backend.get<PaginatedResponse<Profile>>("/profiles", {
        headers: authHeaders(token),
        params: { limit: 50 },
      }),
      backend.get<User>("/users/me", { headers: authHeaders(token) }),
    ]);
    profiles = profilesRes.data.data;
    user = userRes.data;
  } catch {
    redirect("/login");
  }

  const total = profiles.length;
  const males = profiles.filter((p) => p.gender === "male").length;
  const females = profiles.filter((p) => p.gender === "female").length;
  const countries = new Set(profiles.map((p) => p.country_id)).size;
  const recent = profiles.slice(0, 6);

  const stats = [
    {
      label: "Total profiles",
      value: total,
      sub: "loaded",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Male",
      value: `${pct(males, total)}%`,
      sub: `${males} profiles`,
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Female",
      value: `${pct(females, total)}%`,
      sub: `${females} profiles`,
      icon: TrendingUp,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      label: "Countries",
      value: countries,
      sub: "represented",
      icon: Globe,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-neutral-900">
          {user ? `Welcome back, ${user.username}` : "Dashboard"}
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Here's an overview of your profile data.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-neutral-200 p-5"
          >
            <div
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${bg} mb-3`}
            >
              <Icon size={15} className={color} />
            </div>
            <p className="text-2xl font-semibold text-neutral-900">{value}</p>
            <p className="text-xs font-medium text-neutral-700 mt-0.5">
              {label}
            </p>
            <p className="text-xs text-neutral-400">{sub}</p>
          </div>
        ))}
      </div>

      {recent.length > 0 && (
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">
              Recent profiles
            </h2>
            <a
              href="/profiles"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </a>
          </div>
          <ul className="divide-y divide-neutral-100">
            {recent.map((p) => (
              <li key={p.id}>
                <a
                  href={`/profiles/${p.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-900">
                      {p.name}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${genderColor[p.gender]}`}
                    >
                      {p.gender}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${ageGroupColor[p.age_group]}`}
                    >
                      {p.age_group}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span>{p.country_name}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {fmt(p.created_at)}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
