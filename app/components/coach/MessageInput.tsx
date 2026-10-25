"use client";

import { useState, useRef, type KeyboardEvent } from "react";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="p-4 border-t border-slate-800 shrink-0">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-slate-800 text-slate-200 rounded-xl px-4 py-3 text-sm placeholder-slate-500 resize-none outline-none ring-1 ring-slate-700 focus:ring-cyan-500/50 transition-all disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={disabled || !input.trim()}
          className="shrink-0 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors"
        >
          Enviar
        </button>
      </div>
      <p className="text-slate-600 text-[10px] mt-2 text-center">
        Enter para enviar · Shift + Enter para nueva línea
      </p>
    </div>
  );
}
