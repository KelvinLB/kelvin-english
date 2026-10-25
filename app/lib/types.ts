export type EnglishLevel = "desconocido" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type LearningMethodology =
  | "comprension_natural"
  | "repeticion_espaciada"
  | "memoria_activa"
  | "imitacion_patrones"
  | "produccion_propia"
  | "vocabulario_contexto"
  | "temas_interes"
  | "practica_deliberada"
  | "mezcla_temas"
  | "puntos_rachas";

export type MethodologyEffectiveness = Record<LearningMethodology, number>;

export interface BehaviorSignals {
  responseSpeed: "sin datos" | "rápido" | "normal" | "lento";
  frustrationSignals: "sin datos" | "bajo" | "moderado" | "alto";
  engagementLevel: "sin datos" | "bajo" | "medio" | "alto";
}

export interface LearnerProfile {
  currentLevel: EnglishLevel;
  spanishPercentage: number;
  grammarAccuracy: number;
  comprehensionSpeed: number;
  retentionRate: number;
  consistency: number;
  techDocsComprehension: number;
  codeCommentReading: number;
  errorMessageUnderstanding: number;
  methodologyEffectiveness: MethodologyEffectiveness;
  dominantMethodology: LearningMethodology | "ninguna";
  behaviorSignals: BehaviorSignals;
  sessionHistory: SessionRecord[];
  mapPoints: MapPoint[];
  lastUpdate: string;
  totalSessions: number;
  wordsLearned: number;
  interests: string[];
  learningPreferences: LearningPreferences;
}

export interface LearningPreferences {
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
}

export interface SessionRecord {
  id: string;
  date: string;
  duration: number;
  messagesCount: number;
  wordsIntroduced: string[];
  wordsUsed?: string[];
  mistakesDetected: string[];
  methodologyUsed: LearningMethodology[];
  engagementScore: number;
  notes: string;
}

export interface MapPoint {
  id: string;
  sessionId: string;
  x: number;
  y: number;
  label: string;
  levelAt: EnglishLevel;
  date: string;
}

export interface Message {
  id: string;
  role: "coach" | "user";
  content: string;
  timestamp: string;
}

export interface CoachState {
  phase: "diagnostico" | "aprendizaje" | "practica" | "evaluacion";
  questionIndex: number;
  englishIntroduced: boolean;
  sessionStarted: boolean;
}

export interface CoachQuestion {
  id: string;
  text: string;
  purpose: string;
  detects: string[];
}

export type WordCategory = "tech" | "basic" | "context";

export interface EnglishWord {
  word: string;
  spanish: string;
  category: WordCategory;
  pronunciation: string;
  usedByUser?: boolean;
  introducedAt?: string;
}

export interface ActiveSession {
  id: string;
  startedAt: string;
  lastActivityAt: string;
  status: "active" | "completed";
  messagesCount: number;
  wordsIntroduced: EnglishWord[];
  userMistakes: Mistake[];
  durationSeconds: number;
}

export interface Mistake {
  type: "grammar" | "vocabulary" | "spelling";
  original: string;
  correction: string;
  explanation: string;
  context: string;
}

export interface SessionReport {
  sessionId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalMessages: number;
  wordsIntroduced: EnglishWord[];
  wordsUsedByUser: number;
  mistakesCount: number;
  mistakesDetected: Mistake[];
  engagementLevel: "bajo" | "medio" | "alto";
  responseSpeed: "lento" | "normal" | "rápido";
  dominantLearningStyle: keyof LearningPreferences | null;
  metrics: {
    comprehension: number | null;
    accuracy: number | null;
    consistency: number;
  };
}

export interface LastSessionReport {
  report: SessionReport;
  session: ActiveSession;
}
