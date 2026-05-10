"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGardenStore } from "@/store";
import type { ChatMsg } from "@/store";
import { getChatMessages, saveChatMessage } from "@/app/actions/chat";
import { getSeeds } from "@/app/actions/seeds";
import { stardew } from "@/lib/stardewTheme";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Sprout, Minus, X, Trash2 } from "lucide-react";
import { clearChatMessages } from "@/app/actions/chat";

interface ChatWidgetProps {
  projectId: string;
}

export function ChatWidget({ projectId }: ChatWidgetProps) {
  const chatOpen = useGardenStore((s) => s.chatOpen);
  const setChatOpen = useGardenStore((s) => s.setChatOpen);
  const chatMessages = useGardenStore((s) => s.chatMessages);
  const addChatMessage = useGardenStore((s) => s.addChatMessage);
  const updateLastAssistantMessage = useGardenStore((s) => s.updateLastAssistantMessage);
  const setChatMessages = useGardenStore((s) => s.setChatMessages);
  const chatLoading = useGardenStore((s) => s.chatLoading);
  const setChatLoading = useGardenStore((s) => s.setChatLoading);
  const refreshSeeds = useGardenStore((s) => s.setSeeds);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedProjectRef = useRef<string | null>(null);

  // Load chat history when projectId changes
  useEffect(() => {
    if (loadedProjectRef.current === projectId) return;
    loadedProjectRef.current = projectId;

    getChatMessages(projectId).then((msgs) => {
      setChatMessages(
        msgs.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))
      );
    });
  }, [projectId, setChatMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = useCallback(
    async (message: string) => {
      const userMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
      };
      addChatMessage(userMsg);
      setChatLoading(true);

      // Save user message to DB (fire-and-forget)
      saveChatMessage(projectId, "user", message);

      // Prepare history for API (last 20 messages for context window)
      const history = [...chatMessages, userMsg]
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      // Add placeholder assistant message
      const assistantId = crypto.randomUUID();
      addChatMessage({ id: assistantId, role: "assistant", content: "" });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, projectId }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Failed to connect" }));
          updateLastAssistantMessage(
            err.error || "Something went wrong. Please try again."
          );
          setChatLoading(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          updateLastAssistantMessage("No response received.");
          setChatLoading(false);
          return;
        }

        const decoder = new TextDecoder();
        let fullContent = "";
        let seedCreated: ChatMsg["seedCreated"] | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  updateLastAssistantMessage(fullContent);
                }
                if (parsed.seed_created) {
                  seedCreated = parsed.seed_created;
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }

        // Check if the response mentions a seed was created (parse from content)
        if (fullContent.includes('"success":true')) {
          try {
            const seedMatch = fullContent.match(
              /\{[^{}]*"success"\s*:\s*true[^{}]*\}/
            );
            if (seedMatch) {
              const seedData = JSON.parse(seedMatch[0]);
              seedCreated = seedData.seed;
            }
          } catch {
            // Ignore parse errors
          }
        }

        // Update final message with seed card if applicable
        if (seedCreated) {
          const msgs = useGardenStore.getState().chatMessages;
          const updated = msgs.map((m, i) =>
            i === msgs.length - 1 ? { ...m, seedCreated } : m
          );
          setChatMessages(updated);

          // Refresh seeds list
          getSeeds(projectId).then(refreshSeeds);
        }

        // Save assistant response to DB
        if (fullContent) {
          saveChatMessage(projectId, "assistant", fullContent);
        }
      } catch {
        updateLastAssistantMessage(
          "The Garden Guide seems to be resting. Please try again later."
        );
      }

      setChatLoading(false);
    },
    [
      projectId,
      chatMessages,
      addChatMessage,
      updateLastAssistantMessage,
      setChatMessages,
      setChatLoading,
      refreshSeeds,
    ]
  );

  const handleClear = async () => {
    setChatMessages([]);
    await clearChatMessages(projectId);
  };

  // Floating button (collapsed)
  if (!chatOpen) {
    return (
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#7ba65e] border-4 border-[#4a2f1e] rounded-full flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.25),inset_2px_2px_0px_#9ec384] hover:bg-[#8bb66e] active:translate-y-1 active:shadow-none transition-all cursor-pointer animate-bounce"
        style={{ animationDuration: "3s" }}
      >
        <Sprout size={24} className="text-[#fce8cc]" />
      </button>
    );
  }

  // Expanded chat panel
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] flex flex-col bg-[#6a4427] border-4 border-[#4a2f1e] shadow-[6px_6px_0px_rgba(0,0,0,0.3)] rounded-sm overflow-hidden">
      {/* Header */}
      <div className={`${stardew.woodPanel} flex items-center justify-between px-3 py-2 border-b-0`}>
        <div className="flex items-center gap-2">
          <Sprout size={18} className="text-[#fbf236]" />
          <h2
            className={`${stardew.fontPixel} text-sm text-[#fbf236] drop-shadow-[1px_1px_0_#4a2f1e]`}
          >
            Garden Guide
          </h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleClear}
            className="p-1 hover:bg-[#4a2f1e] rounded transition-colors cursor-pointer"
            title="Clear chat"
          >
            <Trash2 size={14} className="text-[#fce8cc]" />
          </button>
          <button
            onClick={() => setChatOpen(false)}
            className="p-1 hover:bg-[#4a2f1e] rounded transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus size={14} className="text-[#fce8cc]" />
          </button>
          <button
            onClick={() => setChatOpen(false)}
            className="p-1 hover:bg-[#4a2f1e] rounded transition-colors cursor-pointer"
            title="Close"
          >
            <X size={14} className="text-[#fce8cc]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-3 bg-[#d4c4a0]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(139,90,43,0.08) 24px, rgba(139,90,43,0.08) 25px)",
        }}
      >
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
            <Sprout size={32} className="text-[#8b5a2b] mb-3" />
            <p className={`${stardew.fontPixel} text-[#8b5a2b] text-xs mb-1`}>
              Welcome to the Garden!
            </p>
            <p className={`${stardew.fontBody} text-[#6a4427] text-xs`}>
              Ask me about seeds in this project, or describe an idea to plant a new one.
            </p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}

        {chatLoading && chatMessages[chatMessages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-[#8b5a2b] ml-9">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-[#8b5a2b] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-[#8b5a2b] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-[#8b5a2b] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={chatLoading} />
    </div>
  );
}
