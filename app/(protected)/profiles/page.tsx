"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Download } from "lucide-react";
import { privateApi } from "@/lib/axios";
import type { Profile, Gender, AgeGroup, PaginatedResponse } from "@/lib/types";

const genderColor: Record<string, string> = {
  male: "bg-blue-50 text-blue-700",
  female: "bg-purple-50 text-purple-700",
};
const ageGroupColor: Record<string, string> = {
  child: "bg-yellow-50 text-yellow-700",
  teenager: "bg-orange-50 text-orange-700",
  adult: "bg-green-50 text-green-700",
  senior: "bg-neutral-100 text-neutral-600",
};

const LIMIT = 20;

type Filters = {
  gender: Gender | "";
  age_group: AgeGroup | "";
  sort_by: "age" | "created_at" | "gender_probability" | "";
  order: "asc" | "desc";
};

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    gender: "",
    age_group: "",
    sort_by: "",
    order: "desc",
  });

  const fetchProfiles = useCallback(
    async (currentPage: number, currentFilters: Filters) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          page: currentPage,
          limit: LIMIT,
          order: currentFilters.order,
        };
        if (currentFilters.gender) params.gender = currentFilters.gender;
        if (currentFilters.age_group) params.age_group = currentFilters.age_group;
        if (currentFilters.sort_by) params.sort_by = currentFilters.sort_by;

        const { data } = await privateApi.get<PaginatedResponse<Profile>>("/api/profiles", { params });
        setProfiles(data.data);
        setTotalPages(data.total_pages);
        setTotal(data.total);
      } catch {
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProfiles(page, filters);
  }, [page, filters, fetchProfiles]);

  async function handleExportCsv() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ format: "csv", order: filters.order });
      if (filters.gender) params.set("gender", filters.gender);
      if (filters.age_group) params.set("age_group", filters.age_group);
      if (filters.sort_by) params.set("sort_by", filters.sort_by);

      const response = await fetch(`/api/profiles/export?${params}`, { credentials: "include" });
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "profiles.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // silent — user sees no download
    } finally {
      setExporting(false);
    }
  }

  function applyFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function FilterBtn({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) {
    return (
      <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          active
            ? "bg-blue-600 border-blue-600 text-white"
            : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
        }`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Profiles</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Browse and filter all profiles.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <SlidersHorizontal size={13} />
          <span className="font-medium">Filters</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-400">Gender</span>
          <div className="flex gap-1">
            <FilterBtn active={filters.gender === ""} onClick={() => applyFilter("gender", "")}>All</FilterBtn>
            <FilterBtn active={filters.gender === "male"} onClick={() => applyFilter("gender", "male")}>Male</FilterBtn>
            <FilterBtn active={filters.gender === "female"} onClick={() => applyFilter("gender", "female")}>Female</FilterBtn>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-400">Age group</span>
          <div className="flex gap-1">
            {(["", "child", "teenager", "adult", "senior"] as const).map((ag) => (
              <FilterBtn key={ag} active={filters.age_group === ag} onClick={() => applyFilter("age_group", ag)}>
                {ag === "" ? "All" : ag.charAt(0).toUpperCase() + ag.slice(1)}
              </FilterBtn>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={13} />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <span className="text-xs text-neutral-400">Sort</span>
          <select
            value={filters.sort_by}
            onChange={(e) => applyFilter("sort_by", e.target.value as Filters["sort_by"])}
            className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Default</option>
            <option value="age">Age</option>
            <option value="created_at">Date added</option>
            <option value="gender_probability">Gender confidence</option>
          </select>
          <select
            value={filters.order}
            onChange={(e) => applyFilter("order", e.target.value as "asc" | "desc")}
            className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse">
              <div className="h-4 bg-neutral-100 rounded w-2/3 mb-3" />
              <div className="h-3 bg-neutral-100 rounded w-1/2 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 py-16 text-center">
          <p className="text-sm text-neutral-500">No profiles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <Link
              key={p.id}
              href={`/profiles/${p.id}`}
              className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-neutral-900">{p.name}</span>
                <span className="text-xs text-neutral-400">{p.country_id}</span>
              </div>
              <div className="flex gap-1.5 mb-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${genderColor[p.gender]}`}>
                  {p.gender}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ageGroupColor[p.age_group]}`}>
                  {p.age_group}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500">
                  <span className="text-neutral-400">Age</span> {p.age} ·{" "}
                  <span className="text-neutral-400">Country</span> {p.country_name}
                </p>
                <p className="text-xs text-neutral-400">
                  {Math.round(p.gender_probability * 100)}% gender confidence ·{" "}
                  {Math.round(p.country_probability * 100)}% country confidence
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} /> Previous
          </button>
          <span className="text-xs text-neutral-400">
            Page {page} of {totalPages} · {total} total
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
