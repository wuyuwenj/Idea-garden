"use client";

import { useEffect, useState } from "react";
import { acceptInvite } from "@/app/actions/team";
import { stardew } from "@/lib/stardewTheme";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "needsAuth" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function handleInvite() {
      const result = await acceptInvite(token);

      if (result.needsAuth) {
        setStatus("needsAuth");
        return;
      }

      if (result.error) {
        setStatus("error");
        setMessage(result.error);
        return;
      }

      if (result.success) {
        setStatus("success");
        setTimeout(() => {
          router.push(`/t/${result.teamSlug}`);
        }, 2000);
      }
    }

    handleInvite();
  }, [token, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#5a8043] p-8 font-serif"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(0,0,0,0.05) 32px, rgba(0,0,0,0.05) 36px)",
      }}
    >
      <div className={`${stardew.woodPanel} p-8 w-full max-w-md text-center`}>
        <h1
          className={`${stardew.fontPixel} text-3xl text-[#fbf236] drop-shadow-[2px_2px_0_#4a2f1e] mb-4`}
        >
          Garden Invite
        </h1>

        {status === "loading" && (
          <p className="text-[#e8d6b3]">Checking invitation...</p>
        )}

        {status === "needsAuth" && (
          <div className="space-y-4">
            <p className="text-[#e8d6b3]">
              You need to sign in or create an account to join this garden.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/login?redirect=/invite/${token}`}
                className={`${stardew.woodButton} px-4 py-2 ${stardew.fontPixel}`}
              >
                Sign In
              </Link>
              <Link
                href={`/signup?redirect=/invite/${token}`}
                className={`${stardew.woodButton} px-4 py-2 ${stardew.fontPixel} bg-[#7ba65e] border-[#364d26]`}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-2">
            <p className="text-[#7ba65e] text-lg">
              You&apos;ve joined the garden!
            </p>
            <p className="text-[#e8d6b3] text-sm">Redirecting...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <p className="text-red-300">{message}</p>
            <Link
              href="/"
              className={`${stardew.woodButton} px-4 py-2 ${stardew.fontPixel} inline-block`}
            >
              Go Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
