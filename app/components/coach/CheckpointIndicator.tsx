"use client";

import type { LearnerProfile, ActiveSession } from "../../lib/types";

interface CheckpointIndicatorProps {
  profile: LearnerProfile;
  activeSession: ActiveSession | null;
}

export default function CheckpointIndicator({ profile, activeSession }: CheckpointIndicatorProps) {
  const hasHistory = profile.totalSessions > 0;
  const isActive = activeSession?.status === "active";

  if (!hasHistory && !isActive) return null;

  return (
    <div className="mx-4 mb-2 p-3 bg-slate-900/60 border border-emerald-800/30 rounded-lg animate-fade-in">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-emerald-400 text-xs font-semibold">
          {isActive ? "Sesión activa" : "Continuar desde donde quedaste"}
        </span>
      </div>
      <p className="text-slate-500 text-[10px] mt-1">
        {hasHistory
          ? `${profile.totalSessions} ${profile.totalSessions === 1 ? "sesión completada" : "sesiones completadas"} · ${profile.wordsLearned} ${profile.wordsLearned === 1 ? "palabra aprendida" : "palabras aprendidas"}`
          : "Sesión en progreso — sigue conversando"}
      </p>
    </div>
  );
}
