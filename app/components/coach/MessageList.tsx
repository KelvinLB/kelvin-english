"use client";

import { useEffect, useRef } from "react";
import type { Message } from "../../lib/types";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages.map((msg, i) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          style={{
            animation: `float-in 0.4s ease-out ${i * 0.03}s forwards`,
            opacity: 0,
          }}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === "coach"
                ? "bg-slate-800/80 text-slate-200 border border-slate-700/50"
                : "bg-cyan-900/40 text-slate-200 border border-cyan-700/30"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </p>
            <span className="text-[10px] text-slate-500 mt-1.5 block">
              {new Date(msg.timestamp).toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
