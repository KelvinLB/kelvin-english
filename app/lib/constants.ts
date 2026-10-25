import type {
  MethodologyEffectiveness,
  LearnerProfile,
  CoachQuestion,
  BehaviorSignals,
  CoachState,
  EnglishWord,
} from "./types";

export const METHODOLOGY_LABELS: Record<keyof MethodologyEffectiveness, string> = {
  comprension_natural: "Comprensión natural",
  repeticion_espaciada: "Repetición espaciada",
  memoria_activa: "Memoria activa",
  imitacion_patrones: "Imitación de patrones",
  produccion_propia: "Producción propia",
  vocabulario_contexto: "Vocabulario en contexto",
  temas_interes: "Temas de interés",
  practica_deliberada: "Práctica deliberada",
  mezcla_temas: "Mezcla de temas",
  puntos_rachas: "Puntos y rachas",
};

export const INITIAL_METHODOLOGY: MethodologyEffectiveness = {
  comprension_natural: 0,
  repeticion_espaciada: 0,
  memoria_activa: 0,
  imitacion_patrones: 0,
  produccion_propia: 0,
  vocabulario_contexto: 0,
  temas_interes: 0,
  practica_deliberada: 0,
  mezcla_temas: 0,
  puntos_rachas: 0,
};

export const INITIAL_BEHAVIOR: BehaviorSignals = {
  responseSpeed: "sin datos",
  frustrationSignals: "sin datos",
  engagementLevel: "sin datos",
};

export const INITIAL_PROFILE: LearnerProfile = {
  currentLevel: "desconocido",
  spanishPercentage: 100,
  grammarAccuracy: 0,
  comprehensionSpeed: 0,
  retentionRate: 0,
  consistency: 0,
  techDocsComprehension: 0,
  codeCommentReading: 0,
  errorMessageUnderstanding: 0,
  methodologyEffectiveness: INITIAL_METHODOLOGY,
  dominantMethodology: "ninguna",
  behaviorSignals: INITIAL_BEHAVIOR,
  sessionHistory: [],
  mapPoints: [],
  lastUpdate: "",
  totalSessions: 0,
  wordsLearned: 0,
  interests: [],
  learningPreferences: {
    reading: 0,
    listening: 0,
    speaking: 0,
    writing: 0,
  },
};

export const INITIAL_COACH_STATE: CoachState = {
  phase: "diagnostico",
  questionIndex: 0,
  englishIntroduced: false,
  sessionStarted: false,
};

export const DIAGNOSTIC_QUESTIONS: CoachQuestion[] = [
  {
    id: "q1",
    text: "Para eso, necesito conocerte un poco. No te voy a hacer un examen aburrido. Solo conversemos.\n\nPrimero: ¿a qué te dedicas o qué haces en tu día a día? Cuéntame sin filtro.",
    purpose: "Detectar intereses, campo profesional, y posibles temas de contenido",
    detects: ["interests", "career", "tech_affinity"],
  },
  {
    id: "q2",
    text: "Interesante. Segunda pregunta: ¿alguna vez intentaste aprender inglés antes? Si lo hiciste, ¿cómo fue esa experiencia? ¿Qué funcionó y qué no?",
    purpose: "Identificar métodos previos, frustraciones, y preferencias de aprendizaje",
    detects: ["past_experience", "frustration_level", "previous_methods"],
  },
  {
    id: "q3",
    text: "Buena información. Última pregunta por ahora: si pudieras elegir libremente, ¿cómo preferirías aprender? ¿Leyendo documentación, viendo videos, escuchando podcasts, practicando conversación, o de otra forma?",
    purpose: "Determinar estilo de aprendizaje preferido",
    detects: ["learning_style", "reading_preference", "audio_visual"],
  },
];

export const STORAGE_KEYS = {
  PROFILE: "kelvin-english-profile",
  MESSAGES: "kelvin-english-messages",
  COACH_STATE: "kelvin-english-coach-state",
  SESSION: "kelvin-english-active-session",
  WORDS: "kelvin-english-words-introduced",
  LAST_REPORT: "kelvin-english-last-report",
} as const;

export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT_SECONDS: 3 * 60,
  WORDS_PER_INTERACTION: 1,
};

export const ENGLISH_WORDS: EnglishWord[] = [
  { word: "error", spanish: "error", category: "tech", pronunciation: "/ˈɛrər/" },
  { word: "function", spanish: "función", category: "tech", pronunciation: "/ˈfʌŋkʃən/" },
  { word: "variable", spanish: "variable", category: "tech", pronunciation: "/ˈvɛriəbəl/" },
  { word: "console", spanish: "consola", category: "tech", pronunciation: "/kənˈsoʊl/" },
  { word: "debug", spanish: "depurar (o depuración)", category: "tech", pronunciation: "/diːˈbʌɡ/" },
  { word: "run", spanish: "ejecutar", category: "tech", pronunciation: "/rʌn/" },
  { word: "build", spanish: "construir (o compilar)", category: "tech", pronunciation: "/bɪld/" },
  { word: "test", spanish: "probar (o prueba)", category: "tech", pronunciation: "/tɛst/" },
  { word: "commit", spanish: "confirmar (en git)", category: "tech", pronunciation: "/kəˈmɪt/" },
  { word: "array", spanish: "arreglo (o array)", category: "tech", pronunciation: "/əˈreɪ/" },
  { word: "hello", spanish: "hola", category: "basic", pronunciation: "/həˈloʊ/" },
  { word: "thanks", spanish: "gracias", category: "basic", pronunciation: "/θæŋks/" },
  { word: "please", spanish: "por favor", category: "basic", pronunciation: "/pliːz/" },
  { word: "yes", spanish: "sí", category: "basic", pronunciation: "/jɛs/" },
  { word: "no", spanish: "no", category: "basic", pronunciation: "/noʊ/" },
  { word: "ok", spanish: "ok / está bien", category: "basic", pronunciation: "/oʊˈkeɪ/" },
  { word: "next", spanish: "siguiente", category: "context", pronunciation: "/nɛkst/" },
  { word: "back", spanish: "atrás / volver", category: "context", pronunciation: "/bæk/" },
  { word: "continue", spanish: "continuar", category: "context", pronunciation: "/kənˈtɪnjuː/" },
  { word: "start", spanish: "empezar / iniciar", category: "context", pronunciation: "/stɑːrt/" },
  { word: "finish", spanish: "terminar / finalizar", category: "context", pronunciation: "/ˈfɪnɪʃ/" },
];

// Palabras que se escriben igual en español: usarlas no prueba inglés.
export const AMBIGUOUS_WORDS = new Set(["error", "variable", "no", "ok"]);

// Palabras funcionales frecuentes en inglés que no existen en español.
export const ENGLISH_COMMON_WORDS = new Set([
  "the", "is", "are", "was", "were", "i", "you", "we", "they", "it", "this",
  "that", "what", "how", "why", "where", "when", "and", "or", "but", "of",
  "to", "in", "on", "for", "with", "my", "your", "have", "do", "does", "did",
  "can", "will", "would", "should", "not", "want", "learn", "know", "like",
  "from", "at", "be", "an", "if", "just", "about", "there", "here", "good",
  "work", "am", "im", "dont", "need", "think", "make", "get",
]);
