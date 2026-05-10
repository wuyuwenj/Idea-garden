"use client";

import type { ChatMsg } from "@/store";
import { stardew } from "@/lib/stardewTheme";
import { Sprout } from "lucide-react";

export function ChatMessage({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#7ba65e] border-2 border-[#4a2f1e] flex items-center justify-center mr-2 mt-1 shrink-0">
          <Sprout size={14} className="text-[#fce8cc]" />
        </div>
      )}
      <div className="flex flex-col gap-1.5 max-w-[85%]">
        <div
          className={`px-3 py-2 text-sm leading-relaxed ${
            isUser
              ? "bg-[#7ba65e] text-[#fce8cc] border-2 border-[#4a6b34] rounded-tl-lg rounded-tr-lg rounded-bl-lg shadow-[inset_1px_1px_0px_#9ec384]"
              : `bg-[#e8d6b3] text-[#4a3525] border-2 border-[#8b5a2b] rounded-tl-lg rounded-tr-lg rounded-br-lg shadow-[inset_1px_1px_0px_#f5e6c8]`
          } ${stardew.fontBody}`}
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {msg.content}
        </div>

        {msg.seedCreated && (
          <div className="bg-[#6a4427] border-2 border-[#4a2f1e] rounded-lg p-2.5 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={`/plants/${msg.seedCreated.plant_type}/seed.svg`}
                alt={msg.seedCreated.plant_type}
                className="w-6 h-6"
                style={{ imageRendering: "pixelated" }}
              />
              <span className={`${stardew.fontPixel} text-[#fbf236] text-xs`}>
                Seed Planted!
              </span>
            </div>
            <p className={`${stardew.fontPixel} text-[#fce8cc] text-xs`}>
              {msg.seedCreated.title}
            </p>
            <div className="flex gap-1 mt-1 flex-wrap">
              <span className="text-[10px] bg-[#8b5a2b] text-[#fce8cc] px-1.5 py-0.5 rounded">
                {msg.seedCreated.priority}
              </span>
              {msg.seedCreated.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-[#5a8043] text-[#fce8cc] px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
