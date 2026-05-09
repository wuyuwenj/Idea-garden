"use client";

import { useCallback, useRef, useState } from "react";
import { inviteMember } from "@/app/actions/team";
import { stardew } from "@/lib/stardewTheme";
import { X } from "lucide-react";

interface InviteMemberDialogProps {
  teamSlug: string;
  onClose: () => void;
}

export function InviteMemberDialog({ teamSlug, onClose }: InviteMemberDialogProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setFieldErrors({});
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await inviteMember(teamSlug, undefined, formData);

    if (result?.success) {
      setStatus("success");
      setMessage(result.message ?? "Invitation sent!");
      formRef.current?.reset();
    } else if (result?.errors) {
      setStatus("error");
      setFieldErrors(result.errors);
    } else if (result?.message) {
      setStatus("error");
      setMessage(result.message);
    }
  }, [teamSlug]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`${stardew.woodPanel} p-6 w-full max-w-md relative`}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#e8d6b3] hover:text-white"
        >
          <X size={20} />
        </button>

        <h2
          className={`${stardew.fontPixel} text-xl text-[#fbf236] drop-shadow-[1px_1px_0_#4a2f1e] mb-4`}
        >
          Invite to Garden
        </h2>

        {status === "success" && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-2 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        {status === "error" && message && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-2 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className={`${stardew.fontPixel} text-[#e8d6b3] text-sm block mb-1`}
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="friend@garden.com"
              className="w-full px-3 py-2 bg-[#4a2f1e] border-2 border-[#3a1f0e] rounded text-[#fce8cc] placeholder-[#8b6b4a] focus:border-[#fbf236] focus:outline-none"
            />
            {fieldErrors.email && (
              <p className="text-red-300 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === "sending" || status === "success"}
            className={`${stardew.woodButton} w-full py-3 ${stardew.fontPixel} bg-[#7ba65e] border-[#364d26] shadow-[inset_2px_2px_0px_#9ec384] disabled:opacity-50`}
          >
            {status === "sending" ? "Sending..." : "Send Invite"}
          </button>
        </form>
      </div>
    </div>
  );
}
