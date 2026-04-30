"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { privateApi } from "@/lib/axios";
import type { Profile, PaginatedResponse } from "@/lib/types";

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

const examples = [
  "young males from Nigeria",
  "senior females in the US",
  "adult males with high confidence",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(q = query) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const { data } = await privateApi.get<PaginatedResponse<Profile>>("/api/profiles/search", {
        params: { q: trimmed },
      });
      setResults(data.data);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleExample(ex: string) {
    setQuery(ex);
    handleSearch(ex);
    inputRef.current?.focus();
  }

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-neutral-900">Search</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Describe what you're looking for in plain English.
        </p>
      </div>

      <div className="relative mb-3">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder='e.g. "young males from Nigeria"'
          className="w-full pl-10 pr-28 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : "Search"}
        </button>
      </div>

      {!results && !loading && (
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => handleExample(ex)}
              className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      )}

      {results !== null && (
        <div className="mt-6">
          <p className="text-xs text-neutral-400 mb-3">
            {results.length === 0
              ? "No results found."
              : `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`}
          </p>

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/profiles/${p.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-neutral-200 px-5 py-4 hover:border-neutral-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-neutral-900">
                      {p.name}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${genderColor[p.gender]}`}>
                      {p.gender}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ageGroupColor[p.age_group]}`}>
                      {p.age_group}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    {p.age}y · {p.country_name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
