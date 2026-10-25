"use client";

import { useState } from "react";

interface DiagnosticPromptProps {
  prompt: string;
}

export default function DiagnosticPrompt({ prompt }: DiagnosticPromptProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-4 mb-4 p-4 bg-slate-900/80 border border-cyan-900/40 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-cyan-400 text-xs font-mono uppercase tracking-wider">
            Prompt de continuidad
          </span>
          <p className="text-slate-500 text-[10px] mt-0.5">
            Cópialo y pégalo aquí para continuar con la Fase 1
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            copied
              ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
              : "bg-cyan-900/40 text-cyan-300 border border-cyan-700/50 hover:bg-cyan-900/60"
          }`}
        >
          {copied ? "Copiado ✓" : "Copiar prompt"}
        </button>
      </div>

      <pre className="text-[11px] text-slate-300 font-mono bg-slate-950/60 rounded-lg p-3 max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800/60">
        {prompt}
      </pre>
    </div>
  );
}
