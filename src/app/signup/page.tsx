"use client";

import { Suspense, useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { stardew } from "@/lib/stardewTheme";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const [state, action, pending] = useActionState(signup, undefined);

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
          Idea Garden
        </h1>
        <p className="text-[#e8d6b3] text-sm text-center mb-6">
          Start your garden today!
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
              htmlFor="name"
              className={`${stardew.fontPixel} text-[#e8d6b3] text-sm block mb-1`}
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Farmer Joe"
              className="w-full px-3 py-2 bg-[#4a2f1e] border-2 border-[#3a1f0e] rounded text-[#fce8cc] placeholder-[#8b6b4a] focus:border-[#fbf236] focus:outline-none"
            />
            {state?.errors?.name && (
              <p className="text-red-300 text-xs mt-1">{state.errors.name}</p>
            )}
          </div>

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
            {pending ? "Planting seeds..." : "Start Garden"}
          </button>
        </form>

        <p className="text-[#e8d6b3] text-sm text-center mt-4">
          Already have a garden?{" "}
          <Link
            href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="text-[#fbf236] hover:underline font-bold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
