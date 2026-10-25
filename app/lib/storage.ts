import type {
  LearnerProfile,
  Message,
  CoachState,
  ActiveSession,
  EnglishWord,
  LastSessionReport,
} from "./types";
import { INITIAL_COACH_STATE, INITIAL_PROFILE, STORAGE_KEYS } from "./constants";

// Completa con valores iniciales los campos que falten en un perfil guardado
// por una versión anterior de la app, sin tocar los datos existentes.
function withProfileDefaults(saved: Partial<LearnerProfile>): LearnerProfile {
  return {
    ...INITIAL_PROFILE,
    ...saved,
    methodologyEffectiveness: {
      ...INITIAL_PROFILE.methodologyEffectiveness,
      ...saved.methodologyEffectiveness,
    },
    behaviorSignals: {
      ...INITIAL_PROFILE.behaviorSignals,
      ...saved.behaviorSignals,
    },
    learningPreferences: {
      ...INITIAL_PROFILE.learningPreferences,
      ...saved.learningPreferences,
    },
  };
}

export function getProfile(): LearnerProfile {
  if (typeof window === "undefined") return INITIAL_PROFILE;
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  if (!data) return INITIAL_PROFILE;
  try {
    return withProfileDefaults(JSON.parse(data) as Partial<LearnerProfile>);
  } catch {
    return INITIAL_PROFILE;
  }
}

export function saveProfile(profile: LearnerProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEYS.PROFILE,
    JSON.stringify({ ...profile, lastUpdate: new Date().toISOString() })
  );
}

export function getMessages(): Message[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  if (!data) return [];
  try {
    return JSON.parse(data) as Message[];
  } catch {
    return [];
  }
}

export function saveMessages(messages: Message[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

export function getCoachState(): CoachState {
  if (typeof window === "undefined") return INITIAL_COACH_STATE;
  const data = localStorage.getItem(STORAGE_KEYS.COACH_STATE);
  if (!data) return INITIAL_COACH_STATE;
  try {
    return { ...INITIAL_COACH_STATE, ...(JSON.parse(data) as Partial<CoachState>) };
  } catch {
    return INITIAL_COACH_STATE;
  }
}

export function saveCoachState(state: CoachState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.COACH_STATE, JSON.stringify(state));
}

export function getActiveSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!data) return null;
  try {
    return JSON.parse(data) as ActiveSession;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: ActiveSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function getWordsIntroduced(): EnglishWord[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.WORDS);
  if (!data) return [];
  try {
    return JSON.parse(data) as EnglishWord[];
  } catch {
    return [];
  }
}

export function saveWordsIntroduced(words: EnglishWord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
}

export function getLastReport(): LastSessionReport | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEYS.LAST_REPORT);
  if (!data) return null;
  try {
    return JSON.parse(data) as LastSessionReport;
  } catch {
    return null;
  }
}

export function saveLastReport(lastReport: LastSessionReport | null): void {
  if (typeof window === "undefined") return;
  if (!lastReport) {
    localStorage.removeItem(STORAGE_KEYS.LAST_REPORT);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.LAST_REPORT, JSON.stringify(lastReport));
}

// Borra todo el progreso guardado. Solo se llama tras confirmación explícita.
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  for (const key of Object.values(STORAGE_KEYS)) {
    localStorage.removeItem(key);
  }
}
