"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

type UploadResult = {
  status: string;
  total_rows: number;
  inserted: number;
  skipped: number;
  reasons: Record<string, number>;
};

type State =
  | { phase: "idle" }
  | { phase: "uploading" }
  | { phase: "success"; result: UploadResult }
  | { phase: "error"; message: string };

const EXPECTED_COLUMNS =
  "name, gender, gender_probability, age, country_id, country_name, country_probability";

export default function UploadClient() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setState({ phase: "error", message: "Only CSV files are accepted." });
      return;
    }

    setState({ phase: "uploading" });

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/profiles/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setState({ phase: "error", message: data?.error ?? `Upload failed (${res.status})` });
        return;
      }

      setState({ phase: "success", result: data });
    } catch {
      setState({ phase: "error", message: "Network error — upload could not be sent." });
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const reset = () => setState({ phase: "idle" });

  if (state.phase === "success") {
    const { result } = state;
    const insertedPct = result.total_rows > 0
      ? Math.round((result.inserted / result.total_rows) * 100)
      : 0;

    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 size={20} className="text-green-500 shrink-0" />
          <h2 className="text-base font-semibold text-neutral-900">Upload complete</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total rows", value: result.total_rows.toLocaleString() },
            { label: "Inserted", value: `${result.inserted.toLocaleString()} (${insertedPct}%)` },
            { label: "Skipped", value: result.skipped.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-neutral-50 rounded-xl p-4">
              <p className="text-xs text-neutral-400 mb-1">{label}</p>
              <p className="text-sm font-semibold text-neutral-900">{value}</p>
            </div>
          ))}
        </div>

        {result.skipped > 0 && Object.keys(result.reasons).length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Skip reasons
            </p>
            <ul className="space-y-2">
              {Object.entries(result.reasons).map(([reason, count]) => (
                <li key={reason} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600 capitalize">
                    {reason.replace(/_/g, " ")}
                  </span>
                  <span className="font-medium text-neutral-900">{count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={reset}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <RotateCcw size={14} />
          Upload another file
        </button>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <XCircle size={20} className="text-red-500 shrink-0" />
          <h2 className="text-base font-semibold text-neutral-900">Upload failed</h2>
        </div>
        <p className="text-sm text-neutral-500 mb-6">{state.message}</p>
        <button
          onClick={reset}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <RotateCcw size={14} />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => state.phase === "idle" && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-3 transition-colors cursor-pointer ${
          state.phase === "uploading"
            ? "border-neutral-200 bg-neutral-50 cursor-default"
            : dragging
            ? "border-blue-400 bg-blue-50"
            : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
        }`}
      >
        {state.phase === "uploading" ? (
          <>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-neutral-500">Uploading — this may take a while…</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
              <Upload size={20} className="text-neutral-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-900">
                Drop your CSV here, or click to browse
              </p>
              <p className="text-xs text-neutral-400 mt-1">Up to 500,000 rows</p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onFileChange}
          disabled={state.phase === "uploading"}
        />
      </div>

      <div className="bg-neutral-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={13} className="text-neutral-400" />
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Expected columns
          </p>
        </div>
        <p className="text-xs text-neutral-500 font-mono">{EXPECTED_COLUMNS}</p>
      </div>
    </div>
  );
}
