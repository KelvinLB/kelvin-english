import type {
  ActiveSession,
  LearnerProfile,
  SessionReport,
  LearningPreferences,
  SessionRecord,
} from "./types";
import { saveProfile } from "./storage";

function getResponseSpeed(
  session: ActiveSession,
  messageCount: number
): "lento" | "normal" | "rápido" {
  if (messageCount < 2) return "normal";
  const start = new Date(session.startedAt).getTime();
  const now = new Date(session.lastActivityAt).getTime();
  const avgMsPerMsg = (now - start) / messageCount;
  if (avgMsPerMsg > 120_000) return "lento";
  if (avgMsPerMsg < 30_000) return "rápido";
  return "normal";
}

function getEngagementLevel(
  messageCount: number,
  durationSec: number
): "bajo" | "medio" | "alto" {
  if (messageCount < 4) return "bajo";
  const msgPerMin = messageCount / Math.max(durationSec / 60, 1);
  if (msgPerMin < 0.5) return "bajo";
  if (msgPerMin < 2) return "medio";
  return "alto";
}

function getDominantLearningStyle(
  profile: LearnerProfile
): keyof LearningPreferences | null {
  const { reading, listening, speaking, writing } = profile.learningPreferences;
  const max = Math.max(reading, listening, speaking, writing);
  if (max === 0) return null;
  if (reading === max) return "reading";
  if (listening === max) return "listening";
  if (speaking === max) return "speaking";
  if (writing === max) return "writing";
  return null;
}

// Porcentaje de los últimos 7 días con al menos una sesión.
function getConsistency(history: SessionRecord[]): number {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const days = new Set(
    history
      .filter((s) => now - new Date(s.date).getTime() < WEEK_MS)
      .map((s) => new Date(s.date).toDateString())
  );
  return Math.round((days.size / 7) * 100);
}

export function analyzeAndSaveSession(
  session: ActiveSession,
  profile: LearnerProfile
): SessionReport {
  const durationSec = session.durationSeconds;
  const durationMin = Math.round(durationSec / 60);
  const wordsUsed = session.wordsIntroduced.filter((w) => w.usedByUser);
  const engagement = getEngagementLevel(
    session.messagesCount,
    durationSec
  );
  const speed = getResponseSpeed(session, session.messagesCount);
  const style = getDominantLearningStyle(profile);

  const record: SessionRecord = {
    id: session.id,
    date: session.startedAt,
    duration: durationSec,
    messagesCount: session.messagesCount,
    wordsIntroduced: session.wordsIntroduced.map((w) => w.word),
    wordsUsed: wordsUsed.map((w) => w.word),
    mistakesDetected: session.userMistakes.map(
      (m) => `${m.original} → ${m.correction}`
    ),
    methodologyUsed: [],
    engagementScore: engagement === "alto" ? 90 : engagement === "medio" ? 50 : 20,
    notes: "",
  };
  const sessionHistory = [...profile.sessionHistory, record];
  const consistency = getConsistency(sessionHistory);

  const report: SessionReport = {
    sessionId: session.id,
    startTime: session.startedAt,
    endTime: session.lastActivityAt,
    durationMinutes: durationMin,
    totalMessages: session.messagesCount,
    wordsIntroduced: session.wordsIntroduced,
    wordsUsedByUser: wordsUsed.length,
    mistakesCount: session.userMistakes.length,
    mistakesDetected: session.userMistakes,
    engagementLevel: engagement,
    responseSpeed: speed,
    dominantLearningStyle: style,
    // Sin análisis real de errores ni de comprensión todavía: no se inventan.
    metrics: {
      comprehension: null,
      accuracy: null,
      consistency,
    },
  };

  const updatedProfile: LearnerProfile = {
    ...profile,
    totalSessions: profile.totalSessions + 1,
    consistency,
    behaviorSignals: {
      ...profile.behaviorSignals,
      responseSpeed: speed,
      engagementLevel: engagement,
    },
    sessionHistory,
    mapPoints: [
      ...profile.mapPoints,
      {
        id: `mp-${Date.now()}`,
        sessionId: session.id,
        x: Math.cos(profile.mapPoints.length * 1.2) * 60 + 100,
        y: Math.sin(profile.mapPoints.length * 1.2) * 60 + 60,
        label: `Sesión ${profile.totalSessions + 1}`,
        levelAt: "desconocido",
        date: session.startedAt,
      },
    ],
    dominantMethodology:
      style === "reading"
        ? "temas_interes"
        : style === "listening"
          ? "comprension_natural"
          : style === "speaking"
            ? "produccion_propia"
            : "ninguna",
  };

  saveProfile(updatedProfile);

  return report;
}
