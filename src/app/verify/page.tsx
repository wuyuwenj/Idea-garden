"use client";

import { Suspense, useActionState, useRef, useState } from "react";
import { verifyEmail, resendVerification } from "@/app/actions/auth";
import { stardew } from "@/lib/stardewTheme";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}

function VerifyForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const redirectTo = searchParams.get("redirect") ?? "";
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [state, action, pending] = useActionState(verifyEmail, undefined);

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleResend() {
    setResendStatus("Sending...");
    const result = await resendVerification(email);
    if (result.success) {
      setResendStatus("Code resent! Check your email.");
    } else {
      setResendStatus(result.message ?? "Failed to resend.");
    }
    setTimeout(() => setResendStatus(null), 5000);
  }

  const otp = digits.join("");

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
          Verify Email
        </h1>
        <p className="text-[#e8d6b3] text-sm text-center mb-6">
          We sent a 6-digit code to{" "}
          <span className="text-[#fbf236] font-bold">{email}</span>
        </p>

        {state?.message && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded mb-4 text-sm text-center">
            {state.message}
          </div>
        )}

        {resendStatus && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-2 rounded mb-4 text-sm text-center">
            {resendStatus}
          </div>
        )}

        <form action={action}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="otp" value={otp} />
          {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

          {/* 6-digit code inputs */}
          <div
            className="flex justify-center gap-3 mb-6"
            onPaste={handlePaste}
          >
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-2xl font-bold bg-[#4a2f1e] border-2 border-[#3a1f0e] rounded text-[#fbf236] focus:border-[#fbf236] focus:outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={pending || otp.length !== 6}
            className={`${stardew.woodButton} w-full py-3 ${stardew.fontPixel} text-lg bg-[#7ba65e] border-[#364d26] shadow-[inset_2px_2px_0px_#9ec384] disabled:opacity-50`}
          >
            {pending ? "Verifying..." : "Verify & Enter Garden"}
          </button>
        </form>

        <p className="text-[#e8d6b3] text-sm text-center mt-4">
          Didn&apos;t get the code?{" "}
          <button
            onClick={handleResend}
            className="text-[#fbf236] hover:underline font-bold"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
