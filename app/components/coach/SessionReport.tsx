"use client";

import { useState } from "react";
import type { SessionReport as SessionReportType } from "../../lib/types";
import { generateSessionPrompt } from "../../lib/coach-data";
import type { LearnerProfile, ActiveSession } from "../../lib/types";

interface SessionReportProps {
  report: SessionReportType;
  profile: LearnerProfile;
  session: ActiveSession;
}

export default function SessionReportCard({
  report,
  profile,
  session,
}: SessionReportProps) {
  const [copied, setCopied] = useState(false);

  const prompt = generateSessionPrompt(profile, session);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { accuracy } = report.metrics;
  const accuracyColor =
    accuracy === null
      ? "text-slate-500"
      : accuracy >= 80
        ? "text-emerald-400"
        : accuracy >= 50
          ? "text-amber-400"
          : "text-slate-400";

  const engagementColor =
    report.engagementLevel === "alto"
      ? "text-emerald-400"
      : report.engagementLevel === "medio"
        ? "text-amber-400"
        : "text-slate-400";

  return (
    <div className="mx-4 mb-4 animate-fade-in">
      {/* Summary header */}
      <div className="flex items-center justify-between p-3 bg-slate-900/80 border border-amber-800/30 rounded-t-xl">
        <div>
          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
            Sesión completada
          </span>
          <p className="text-slate-400 text-[10px] mt-0.5">
            {report.durationMinutes} min · {report.totalMessages} mensajes
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

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-px bg-slate-800/50">
        <div className="bg-slate-900/60 p-3 text-center">
          <p className={`text-lg font-mono font-bold ${accuracyColor}`}>
            {accuracy === null ? "—" : `${accuracy}%`}
          </p>
          <p className="text-slate-500 text-[10px]">Exactitud</p>
        </div>
        <div className="bg-slate-900/60 p-3 text-center">
          <p className={`text-lg font-mono font-bold ${engagementColor}`}>
            {report.engagementLevel === "alto"
              ? "Alto"
              : report.engagementLevel === "medio"
                ? "Medio"
                : "Bajo"}
          </p>
          <p className="text-slate-500 text-[10px]">Engagement</p>
        </div>
        <div className="bg-slate-900/60 p-3 text-center">
          <p className="text-lg font-mono font-bold text-cyan-400">
            {report.wordsUsedByUser}/{report.wordsIntroduced.length}
          </p>
          <p className="text-slate-500 text-[10px]">Palabras usadas</p>
        </div>
      </div>

      {report.mistakesDetected.length > 0 && (
        <div className="bg-slate-900/60 border-t border-slate-800/50 p-3 rounded-b-xl">
          <p className="text-slate-400 text-[10px] font-medium mb-1">
            Errores detectados:
          </p>
          {report.mistakesDetected.map((m, i) => (
            <div key={i} className="flex items-baseline gap-1 text-[10px] text-slate-500">
              <span className="text-red-400/70">{m.original}</span>
              <span>→</span>
              <span className="text-emerald-400/70">{m.correction}</span>
            </div>
          ))}
        </div>
      )}

      {/* Prompt block */}
      <pre className="text-[10px] text-slate-500 font-mono bg-slate-950/40 rounded-b-xl border-x border-b border-slate-800/50 p-3 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
        {prompt}
      </pre>
    </div>
  );
}
