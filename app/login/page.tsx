import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";


export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const store = await cookies();
  if (store.has("access_token")) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Insighta
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Name intelligence platform
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900 mb-1">
            Sign in
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            Use your GitHub account to continue.
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
              Authentication failed. Please try again.
            </div>
          )}

          <a
            href="/api/auth/login"
            className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium transition-colors"
          >
            <Image src="/github.svg" alt="GitHub" width={16} height={16} className="invert" />
            Continue with GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
