"use client";

import { useEffect, useState } from "react";
import type { Message, LearnerProfile, LastSessionReport } from "../../lib/types";
import type { ActiveSession } from "../../lib/types";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import DiagnosticPrompt from "./DiagnosticPrompt";
import SessionReportCard from "./SessionReport";
import CheckpointIndicator from "./CheckpointIndicator";
import { generateProfilePrompt } from "../../lib/coach-data";

interface CoachPanelProps {
  messages: Message[];
  onSend: (message: string) => void;
  isLoading: boolean;
  englishPercentage: number;
  diagnosticComplete: boolean;
  profile: LearnerProfile;
  activeSession: ActiveSession | null;
  lastReport: LastSessionReport | null;
  onEndSession: () => void;
}

export default function CoachPanel({
  messages,
  onSend,
  isLoading,
  englishPercentage,
  diagnosticComplete,
  profile,
  activeSession,
  lastReport,
  onEndSession,
}: CoachPanelProps) {
  const isActive = activeSession?.status === "active";
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  const dur = isActive && activeSession
    ? Math.max(
        Math.floor((now - new Date(activeSession.startedAt).getTime()) / 1000),
        0
      )
    : 0;
  const min = Math.floor(dur / 60);
  const seg = dur % 60;
  const timeStr = `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="p-4 border-b border-slate-800 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-slate-200 font-bold text-lg">Mi Coach</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Aprendizaje personalizado · Español{" "}
            {100 - englishPercentage}%
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <>
              <span className="text-emerald-400/80 text-[10px] font-mono">
                {timeStr}
              </span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <button
                onClick={onEndSession}
                className="text-[10px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500 transition-colors"
              >
                Terminar
              </button>
            </>
          )}
          {englishPercentage > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${englishPercentage}%` }}
                />
              </div>
              <span className="text-amber-400 text-[10px] font-mono">
                {englishPercentage}% EN
              </span>
            </div>
          )}
        </div>
      </div>
      <CheckpointIndicator profile={profile} activeSession={activeSession} />
      <MessageList messages={messages} />
      {diagnosticComplete && !lastReport && (
        <DiagnosticPrompt prompt={generateProfilePrompt(profile)} />
      )}
      {lastReport && (
        <SessionReportCard
          report={lastReport.report}
          profile={profile}
          session={lastReport.session}
        />
      )}
      <MessageInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}
