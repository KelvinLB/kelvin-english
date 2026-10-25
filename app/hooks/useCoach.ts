"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  Message,
  CoachState,
  LearnerProfile,
  ActiveSession,
  EnglishWord,
  LastSessionReport,
} from "../lib/types";
import {
  getFirstMessage,
  getCoachResponse,
  analyzeUserResponse,
  pickNewWords,
  checkEnglishUsage,
  computeSpanishPercentage,
  isEndSessionCommand,
} from "../lib/coach-data";
import {
  getProfile,
  getMessages,
  saveMessages,
  getCoachState,
  saveCoachState,
  getActiveSession,
  saveActiveSession,
  getWordsIntroduced,
  saveWordsIntroduced,
  getLastReport,
  saveLastReport,
  saveProfile,
  clearAllData,
} from "../lib/storage";
import { analyzeAndSaveSession } from "../lib/session-analyzer";
import {
  DIAGNOSTIC_QUESTIONS,
  INITIAL_COACH_STATE,
  INITIAL_PROFILE,
  SESSION_CONFIG,
} from "../lib/constants";

type EndReason = "manual" | "inactividad";

const INACTIVITY_MS = SESSION_CONFIG.INACTIVITY_TIMEOUT_SECONDS * 1000;

function createEndMessage(reason: EndReason): Message {
  const now = new Date();
  return {
    id: `coach-end-${now.getTime()}`,
    role: "coach",
    content:
      reason === "manual"
        ? "Sesión completada. He registrado los datos de esta conversación. Revisa el reporte abajo para ver tus métricas reales."
        : "Cerré la sesión por inactividad. Registré los datos hasta tu último mensaje. Revisa el reporte abajo.",
    timestamp: now.toISOString(),
  };
}

// Cuenta solo las palabras que no se habían usado en sesiones anteriores.
function countNewlyLearned(used: string[], profile: LearnerProfile): number {
  const learnedBefore = new Set(
    profile.sessionHistory.flatMap((s) => s.wordsUsed ?? [])
  );
  return used.filter((w) => !learnedBefore.has(w)).length;
}

export function useCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [coachState, setCoachState] = useState<CoachState>(INITIAL_COACH_STATE);
  const [profile, setProfile] = useState<LearnerProfile>(INITIAL_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [lastReport, setLastReport] = useState<LastSessionReport | null>(null);

  const initialized = useRef(false);
  const lastActivityRef = useRef(Date.now());
  const wordsIntroducedRef = useRef<EnglishWord[]>([]);

  // Único camino para cerrar una sesión (botón, comando o inactividad).
  // Deja el estado listo para que el siguiente mensaje abra una sesión nueva.
  const finishSession = useCallback(
    (
      session: ActiveSession,
      baseProfile: LearnerProfile,
      baseMessages: Message[],
      baseState: CoachState,
      endedAt: number,
      reason: EndReason
    ) => {
      const ended: ActiveSession = {
        ...session,
        status: "completed",
        lastActivityAt: new Date(endedAt).toISOString(),
        durationSeconds:
          (endedAt - new Date(session.startedAt).getTime()) / 1000,
      };
      const report = analyzeAndSaveSession(ended, baseProfile);
      const updatedProfile = getProfile();
      const finalMessages = [...baseMessages, createEndMessage(reason)];
      const newState: CoachState = { ...baseState, sessionStarted: false };
      const newReport: LastSessionReport = { report, session: ended };

      wordsIntroducedRef.current = [];
      saveActiveSession(null);
      saveWordsIntroduced([]);
      saveLastReport(newReport);
      saveMessages(finalMessages);
      saveCoachState(newState);

      setActiveSession(null);
      setProfile(updatedProfile);
      setMessages(finalMessages);
      setCoachState(newState);
      setLastReport(newReport);
    },
    []
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const savedMessages = getMessages();
    if (savedMessages.length === 0) {
      const firstMsg = getFirstMessage();
      setMessages([firstMsg]);
      saveMessages([firstMsg]);
      return;
    }

    const savedState = getCoachState();
    const savedProfile = getProfile();
    const savedSession = getActiveSession();

    setMessages(savedMessages);
    setCoachState(savedState);
    setProfile(savedProfile);
    setLastReport(getLastReport());
    wordsIntroducedRef.current = getWordsIntroduced();

    if (savedSession?.status === "active") {
      const lastActivity = new Date(savedSession.lastActivityAt).getTime();
      if (Date.now() - lastActivity >= INACTIVITY_MS) {
        finishSession(
          savedSession,
          savedProfile,
          savedMessages,
          savedState,
          lastActivity,
          "inactividad"
        );
      } else {
        lastActivityRef.current = lastActivity;
        setActiveSession(savedSession);
      }
    } else if (savedState.sessionStarted) {
      // Versiones anteriores dejaban la sesión marcada como iniciada después
      // de cerrarla, lo que impedía abrir la siguiente.
      const repaired: CoachState = { ...savedState, sessionStarted: false };
      setCoachState(repaired);
      saveCoachState(repaired);
      saveActiveSession(null);
    }
  }, [finishSession]);

  useEffect(() => {
    if (activeSession) {
      saveActiveSession(activeSession);
    }
  }, [activeSession]);

  useEffect(() => {
    if (activeSession?.status !== "active") return;
    const timer = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= INACTIVITY_MS) {
        finishSession(
          activeSession,
          profile,
          messages,
          coachState,
          lastActivityRef.current,
          "inactividad"
        );
      }
    }, 30_000);
    return () => clearInterval(timer);
  }, [activeSession, profile, messages, coachState, finishSession]);

  const endSession = useCallback(() => {
    if (activeSession?.status !== "active") return;
    finishSession(activeSession, profile, messages, coachState, Date.now(), "manual");
  }, [activeSession, profile, messages, coachState, finishSession]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      setIsLoading(true);

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMsg];
      const analysis = analyzeUserResponse(content);
      const updatedProfile: LearnerProfile = {
        ...profile,
        spanishPercentage: computeSpanishPercentage(updatedMessages),
      };
      const newState = { ...coachState };
      let coachMsg: Message;
      let newSession = activeSession;

      if (analysis.hasTechAffinity) {
        updatedProfile.interests = [
          ...new Set([...updatedProfile.interests, ...analysis.interests]),
        ];
      }
      if (analysis.learningStyles.length > 0) {
        const prefs = { ...updatedProfile.learningPreferences };
        for (const style of analysis.learningStyles) {
          prefs[style] = Math.min(prefs[style] + 15, 100);
        }
        updatedProfile.learningPreferences = prefs;
      }
      if (analysis.hasPastFrustration) {
        updatedProfile.behaviorSignals = {
          ...updatedProfile.behaviorSignals,
          frustrationSignals: "moderado",
        };
      }

      if (isEndSessionCommand(content) && newSession?.status === "active") {
        finishSession(newSession, updatedProfile, updatedMessages, newState, Date.now(), "manual");
        setIsLoading(false);
        return;
      }

      if (newState.phase === "aprendizaje" && !newState.sessionStarted) {
        coachMsg = getCoachResponse(newState, undefined, updatedProfile.totalSessions + 1);
        newState.sessionStarted = true;

        const now = new Date().toISOString();
        newSession = {
          id: `session-${Date.now()}`,
          startedAt: now,
          lastActivityAt: now,
          status: "active",
          messagesCount: 1,
          wordsIntroduced: [],
          userMistakes: [],
          durationSeconds: 0,
        };
        setActiveSession(newSession);
        setLastReport(null);
        saveLastReport(null);
        wordsIntroducedRef.current = [];
        saveWordsIntroduced([]);

      } else if (
        newState.phase === "aprendizaje" &&
        newState.sessionStarted &&
        newSession?.status === "active"
      ) {
        const usedEnglish = checkEnglishUsage(content, newSession.wordsIntroduced);
        updatedProfile.wordsLearned += countNewlyLearned(usedEnglish, updatedProfile);

        const newWords = pickNewWords(
          wordsIntroducedRef.current,
          SESSION_CONFIG.WORDS_PER_INTERACTION,
          updatedProfile.interests.length > 0
        );
        wordsIntroducedRef.current = [...wordsIntroducedRef.current, ...newWords];
        saveWordsIntroduced(wordsIntroducedRef.current);

        const now = new Date();
        newSession = {
          ...newSession,
          messagesCount: newSession.messagesCount + 1,
          lastActivityAt: now.toISOString(),
          durationSeconds:
            (now.getTime() - new Date(newSession.startedAt).getTime()) / 1000,
          wordsIntroduced: [
            ...newSession.wordsIntroduced.map((w) =>
              usedEnglish.includes(w.word) ? { ...w, usedByUser: true } : w
            ),
            ...newWords.map((w) => ({
              ...w,
              introducedAt: now.toISOString(),
              usedByUser: false,
            })),
          ],
        };
        newState.englishIntroduced = true;

        setActiveSession(newSession);
        coachMsg = getCoachResponse(newState, newWords);

      } else if (newState.phase === "diagnostico") {
        // questionIndex apunta a la siguiente pregunta por mostrar.
        coachMsg = getCoachResponse(newState);
        if (newState.questionIndex < DIAGNOSTIC_QUESTIONS.length) {
          newState.questionIndex += 1;
        } else {
          newState.phase = "aprendizaje";
          newState.questionIndex = 0;
        }

      } else {
        coachMsg = getCoachResponse(newState);
      }

      const finalMessages = [...updatedMessages, coachMsg];

      setMessages(finalMessages);
      setCoachState(newState);
      setProfile(updatedProfile);

      saveMessages(finalMessages);
      saveCoachState(newState);
      saveProfile(updatedProfile);

      lastActivityRef.current = Date.now();
      setIsLoading(false);
    },
    [messages, coachState, profile, activeSession, finishSession]
  );

  const resetProgress = useCallback(() => {
    clearAllData();
    const firstMsg = getFirstMessage();
    wordsIntroducedRef.current = [];
    lastActivityRef.current = Date.now();
    setMessages([firstMsg]);
    setCoachState(INITIAL_COACH_STATE);
    setProfile(INITIAL_PROFILE);
    setActiveSession(null);
    setLastReport(null);
    saveMessages([firstMsg]);
  }, []);

  return {
    messages,
    coachState,
    profile,
    isLoading,
    activeSession,
    lastReport,
    sendMessage,
    endSession,
    resetProgress,
  };
}
