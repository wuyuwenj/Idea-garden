"use client";

import { Suspense, useActionState } from "react";
import { login } from "@/app/actions/auth";
import { stardew } from "@/lib/stardewTheme";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#5a8043] p-8 font-serif"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(0,0,0,0.05) 32px, rgba(0,0,0,0.05) 36px)",
      }}
    >
      <div className={`${stardew.woodPanel} p-8 w-full max-w-md`}>
        <h1
          className={`${stardew.fontPixel} text-3xl text-[#fbf236] drop-shadow-[2px_2px_0_#4a2f1e] text-center mb-2`}
        >
          Seedbase
        </h1>
        <p className="text-[#e8d6b3] text-sm text-center mb-6">
          Welcome back, farmer!
        </p>

        {state?.message && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            {state.message}
          </div>
        )}

        <form action={action} className="space-y-4">
          {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
          <div>
            <label
              htmlFor="email"
              className={`${stardew.fontPixel} text-[#e8d6b3] text-sm block mb-1`}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="farmer@garden.com"
              className="w-full px-3 py-2 bg-[#4a2f1e] border-2 border-[#3a1f0e] rounded text-[#fce8cc] placeholder-[#8b6b4a] focus:border-[#fbf236] focus:outline-none"
            />
            {state?.errors?.email && (
              <p className="text-red-300 text-xs mt-1">{state.errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className={`${stardew.fontPixel} text-[#e8d6b3] text-sm block mb-1`}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-[#4a2f1e] border-2 border-[#3a1f0e] rounded text-[#fce8cc] placeholder-[#8b6b4a] focus:border-[#fbf236] focus:outline-none"
            />
            {state?.errors?.password && (
              <p className="text-red-300 text-xs mt-1">
                {state.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className={`${stardew.woodButton} w-full py-3 ${stardew.fontPixel} text-lg bg-[#7ba65e] border-[#364d26] shadow-[inset_2px_2px_0px_#9ec384] disabled:opacity-50`}
          >
            {pending ? "Entering garden..." : "Enter Garden"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#4a2f1e]" />
          <span className={`${stardew.fontPixel} text-[#8b6b4a] text-xs`}>or</span>
          <div className="flex-1 h-px bg-[#4a2f1e]" />
        </div>

        <a
          href={`/api/auth/github${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className={`${stardew.woodButton} w-full py-3 ${stardew.fontPixel} text-sm flex items-center justify-center gap-2`}
        >
          <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Continue with GitHub
        </a>

        <p className="text-[#e8d6b3] text-sm text-center mt-4">
          New farmer?{" "}
          <Link
            href={`/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="text-[#fbf236] hover:underline font-bold"
          >
            Plant your first seed
          </Link>
        </p>
      </div>
    </div>
  );
}
