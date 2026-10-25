"use client";

import { useState } from "react";
import type { LearnerProfile } from "../../lib/types";
import GrowingSeed from "./GrowingSeed";
import MetricsGrid from "./MetricsGrid";

interface EvolutionPanelProps {
  profile: LearnerProfile;
  sessionCount: number;
  wordsLearned: number;
  onReset: () => void;
}

export default function EvolutionPanel({ profile, sessionCount, wordsLearned, onReset }: EvolutionPanelProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="p-4 border-b border-slate-800 shrink-0">
        <h2 className="text-slate-200 font-bold text-lg">Mi Evolución</h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Tu mapa de aprendizaje en tiempo real
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
        <GrowingSeed
          sessionCount={sessionCount}
          wordsLearned={wordsLearned}
          accuracy={profile.grammarAccuracy}
          comprehension={profile.comprehensionSpeed}
        />
        <MetricsGrid profile={profile} />

        {/* Reinicio con confirmación explícita: nunca borra datos de un clic */}
        <div className="pt-2 border-t border-slate-800/60">
          {confirmingReset ? (
            <div className="p-3 bg-slate-900/60 border border-red-900/40 rounded-lg animate-fade-in">
              <p className="text-slate-300 text-xs font-medium">
                ¿Borrar todo tu progreso?
              </p>
              <p className="text-slate-500 text-[10px] mt-1 leading-tight">
                Se eliminan tu perfil, sesiones, palabras y la conversación. Vuelves al diagnóstico. No se puede deshacer.
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setConfirmingReset(false)}
                  className="flex-1 text-[11px] text-slate-300 px-2 py-1.5 rounded border border-slate-700 hover:border-slate-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onReset();
                    setConfirmingReset(false);
                  }}
                  className="flex-1 text-[11px] text-red-300 px-2 py-1.5 rounded border border-red-800/60 bg-red-950/40 hover:bg-red-950/70 transition-colors"
                >
                  Sí, borrar todo
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingReset(true)}
              className="w-full text-[10px] text-slate-600 hover:text-slate-400 py-1 transition-colors"
            >
              Reiniciar progreso
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
