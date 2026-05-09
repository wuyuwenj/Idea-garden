"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { exchangeOAuthCodeAction } from "@/app/actions/auth";
import { Suspense } from "react";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get("insforge_code") ?? searchParams.get("code");
    const redirectTo = searchParams.get("redirect") || "/";

    if (!code) {
      router.replace("/login");
      return;
    }

    exchangeOAuthCodeAction(code).then((result) => {
      if (result?.message) {
        router.replace(`/login?error=${encodeURIComponent(result.message)}`);
      } else {
        router.replace(redirectTo);
      }
    });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5a8043]">
      <p className="text-[#e8d6b3] font-serif">Completing login...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
