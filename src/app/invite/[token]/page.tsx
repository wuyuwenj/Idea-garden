"use client";

import { useEffect, useState } from "react";
import { acceptInvite, getInviteDetails } from "@/app/actions/team";
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

              <Link
                href={`/signup?redirect=/invite/${token}`}
                className={`${stardew.woodButton} px-6 py-3 ${stardew.fontPixel} text-lg bg-[#7ba65e] border-[#364d26] shadow-[inset_2px_2px_0px_#9ec384] inline-block w-full`}
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
