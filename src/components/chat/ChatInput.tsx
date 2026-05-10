"use client";

import { useState, useRef } from "react";
import { stardew } from "@/lib/stardewTheme";
import { Send } from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Plant a seed", prompt: "I have an idea I'd like to plant as a seed." },
  { label: "Find similar ideas", prompt: "Can you search for seeds related to " },
];

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t-2 border-[#4a2f1e] bg-[#8b5a2b] p-2">
      {/* Quick actions */}
      <div className="flex gap-1.5 mb-2 overflow-x-auto">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => {
              setValue(action.prompt);
              inputRef.current?.focus();
            }}
            disabled={disabled}
            className={`${stardew.fontPixel} text-[10px] px-2 py-1 bg-[#a6754b] border-2 border-[#4a2f1e] text-[#fce8cc] hover:bg-[#b07d4b] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the Garden Guide..."
          disabled={disabled}
          rows={1}
          className={`${stardew.parchmentInput} text-sm resize-none min-h-[36px] max-h-[80px] rounded-none flex-1`}
          style={{ overflow: "auto" }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={`${stardew.woodButton} p-2 disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Send size={16} className="text-[#fce8cc]" />
        </button>
      </div>
    </div>
  );
}
