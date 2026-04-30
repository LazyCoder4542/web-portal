import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CallbackClient from "./client";

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <Loader2 size={20} className="text-neutral-400 animate-spin" />
        </div>
      }
    >
      <CallbackClient />
    </Suspense>
  );
}
