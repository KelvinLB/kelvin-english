"use client";

import { useState } from "react";
import { useCoach } from "./hooks/useCoach";
import CoachPanel from "./components/coach/CoachPanel";
import EvolutionPanel from "./components/evolution/EvolutionPanel";

export default function Home() {
  const [mobileTab, setMobileTab] = useState<"coach" | "evolution">("coach");
  const {
    messages,
    coachState,
    profile,
    isLoading,
    activeSession,
    lastReport,
    sendMessage,
    endSession,
    resetProgress,
  } = useCoach();

  const diagnosticComplete =
    coachState.phase === "aprendizaje" &&
    !coachState.sessionStarted &&
    profile.totalSessions === 0;

  return (
    <main className="h-dvh flex flex-col lg:flex-row bg-slate-950 text-slate-200">
      <div className="lg:hidden flex shrink-0 border-b border-slate-800">
        <button
          onClick={() => setMobileTab("coach")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileTab === "coach"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Mi Coach
        </button>
        <button
          onClick={() => setMobileTab("evolution")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mobileTab === "evolution"
              ? "text-cyan-400 border-b-2 border-cyan-400"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          Mi Evolución
        </button>
      </div>

      <div
        className={`
          flex-1 min-h-0
          ${mobileTab === "coach" ? "flex" : "hidden"}
          lg:flex
        `}
      >
        <CoachPanel
          messages={messages}
          onSend={sendMessage}
          isLoading={isLoading}
          englishPercentage={100 - profile.spanishPercentage}
          diagnosticComplete={diagnosticComplete}
          profile={profile}
          activeSession={activeSession}
          lastReport={lastReport}
          onEndSession={endSession}
        />
      </div>

      <div
        className={`
          flex-1 min-h-0 lg:flex-initial lg:w-[400px] lg:border-l lg:border-slate-800
          ${mobileTab === "evolution" ? "flex" : "hidden"}
          lg:flex
        `}
      >
        <EvolutionPanel
          profile={profile}
          sessionCount={profile.totalSessions}
          wordsLearned={profile.wordsLearned}
          onReset={resetProgress}
        />
      </div>
    </main>
  );
}
