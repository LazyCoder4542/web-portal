"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CallbackClient() {
  const params = useSearchParams();
  const hasRun = useRef(false);
  const [errorDetail, setErrorDetail] = useState("");

  useEffect(() => {
    // Guard against React Strict Mode double-invocation consuming a single-use code
    if (hasRun.current) return;
    hasRun.current = true;

    const code = params.get("code");

    if (!code) {
      console.error("[callback] No code in URL params");
      window.location.replace("/login?error=1");
      return;
    }

    console.log("[callback] Exchanging code…");

    fetch(`/api/auth/exchange?code=${code}`)
      .then(async (res) => {
        if (res.ok) {
          console.log("[callback] Exchange succeeded, redirecting to dashboard");
          // Hard navigation so the browser sends the freshly-set HTTP-only cookies
          // with the first request to the dashboard — soft navigation (router.replace)
          // can race against the Set-Cookie flush and leave the user stuck on this page.
          window.location.replace("/dashboard");
        } else {
          const body = await res.text().catch(() => "");
          console.error("[callback] Exchange failed", res.status, body);
          setErrorDetail(`${res.status} — ${body || "no response body"}`);
        }
      })
      .catch((err) => {
        console.error("[callback] Network error", err);
        setErrorDetail(String(err));
      });
  }, [params]);

  if (errorDetail) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-sm w-full text-center">
          <p className="text-sm font-medium text-red-600 mb-2">Sign-in failed</p>
          <p className="text-xs text-neutral-400 font-mono break-all">{errorDetail}</p>
          <a
            href="/login"
            className="mt-5 inline-block text-sm text-blue-600 hover:text-blue-700"
          >
            Try again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={20} className="text-neutral-400 animate-spin" />
        <p className="text-sm text-neutral-500">Signing you in…</p>
      </div>
    </div>
  );
}
