"use client";

import { useEffect, useState } from "react";
import { acceptInvite, getInviteDetails } from "@/app/actions/team";
import { signInWithGitHub } from "@/app/actions/auth";
import { stardew } from "@/lib/stardewTheme";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Flower2 } from "lucide-react";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [status, setStatus] = useState<"loading" | "needsAuth" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [teamName, setTeamName] = useState("");
  const [invitedEmail, setInvitedEmail] = useState("");

  useEffect(() => {
    async function handleInvite() {
      // First fetch invite details to display
      const details = await getInviteDetails(token);
      if (details.error) {
        setStatus("error");
        setMessage(details.error);
        return;
      }
      setTeamName(details.teamName ?? "");
      setInvitedEmail(details.invitedEmail ?? "");

      // Then try to accept
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
        {/* Garden icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#7ba65e] border-4 border-[#364d26] rounded-lg flex items-center justify-center">
            <Flower2 size={32} className="text-[#fbf236]" />
          </div>
        </div>

        {status === "loading" && (
          <p className="text-[#e8d6b3]">Checking invitation...</p>
        )}

        {status === "needsAuth" && (
          <div className="space-y-4">
            <h1 className={`${stardew.fontPixel} text-2xl text-[#fbf236] drop-shadow-[2px_2px_0_#4a2f1e]`}>
              You&apos;ve been invited to
            </h1>
            <h2 className="text-[#fce8cc] text-2xl font-bold">
              {teamName}
            </h2>
            <p className="text-[#e8d6b3] text-sm">
              Idea Garden helps your team plant ideas, grow progress, and harvest finished work.
            </p>

            <div className="border-t border-[#4a2f1e] pt-4 mt-4">
              <p className="text-[#e8d6b3] text-sm mb-4">
                To accept the invitation, sign up as<br />
                <span className="text-[#fbf236] font-bold">{invitedEmail}</span>
              </p>

              <button
                type="button"
                onClick={() => signInWithGitHub(`/invite/${token}`)}
                className={`${stardew.woodButton} px-6 py-3 ${stardew.fontPixel} text-sm bg-[#7ba65e] border-[#364d26] shadow-[inset_2px_2px_0px_#9ec384] w-full flex items-center justify-center gap-2`}
              >
                <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Continue with GitHub
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#4a2f1e]" />
                <span className={`${stardew.fontPixel} text-[#8b6b4a] text-xs`}>or</span>
                <div className="flex-1 h-px bg-[#4a2f1e]" />
              </div>

              <Link
                href={`/signup?redirect=/invite/${token}`}
                className={`${stardew.woodButton} px-6 py-3 ${stardew.fontPixel} text-lg inline-block w-full text-center`}
              >
                Sign Up & Join
              </Link>
              <p className="text-[#e8d6b3] text-sm mt-3">
                Already have an account?{" "}
                <Link
                  href={`/login?redirect=/invite/${token}`}
                  className="text-[#fbf236] hover:underline font-bold"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-2">
            <h1 className={`${stardew.fontPixel} text-2xl text-[#fbf236] drop-shadow-[2px_2px_0_#4a2f1e]`}>
              Welcome to {teamName}!
            </h1>
            <p className="text-[#7ba65e] text-lg">
              You&apos;ve joined the garden!
            </p>
            <p className="text-[#e8d6b3] text-sm">Redirecting...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <h1 className={`${stardew.fontPixel} text-2xl text-[#fbf236] drop-shadow-[2px_2px_0_#4a2f1e]`}>
              Garden Invite
            </h1>
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
