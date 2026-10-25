import type {
  Message,
  CoachState,
  LearningPreferences,
  LearnerProfile,
  EnglishWord,
  ActiveSession,
} from "./types";
import {
  DIAGNOSTIC_QUESTIONS,
  ENGLISH_WORDS,
  AMBIGUOUS_WORDS,
  ENGLISH_COMMON_WORDS,
} from "./constants";

// Busca un término como palabra completa (respeta acentos y ñ).
function containsTerm(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, "iu").test(text);
}

const FIRST_MESSAGE: Message = {
  id: "coach-init",
  role: "coach",
  content:
    "Hola. Soy tu coach personal de inglés.\n\nNo soy un asistente genérico ni un profesor tradicional. Soy un sistema diseñado para descubrir cómo aprendes tú específicamente.\n\nCada persona aprende diferente. Mi trabajo no es enseñarte inglés de forma genérica — es encontrar la manera exacta en que tu cerebro absorbe un idioma nuevo.\n\nVoy a analizar cómo respondes, qué te funciona, qué te frustra y qué te engancha. Con esos datos reales, voy a ajustar todo a ti. Sin suposiciones. Sin fórmulas prefabricadas.\n\n¿Tiene sentido?",
  timestamp: new Date().toISOString(),
};

export function getFirstMessage(): Message {
  return { ...FIRST_MESSAGE, timestamp: new Date().toISOString() };
}

export function getCoachResponse(
  coachState: CoachState,
  newWords?: EnglishWord[],
  sessionNumber = 1
): Message {
  const ts = new Date().toISOString();

  if (coachState.phase === "diagnostico") {
    if (coachState.questionIndex < DIAGNOSTIC_QUESTIONS.length) {
      return {
        id: `coach-${Date.now()}`,
        role: "coach",
        content: DIAGNOSTIC_QUESTIONS[coachState.questionIndex].text,
        timestamp: ts,
      };
    }

    return {
      id: `coach-${Date.now()}`,
      role: "coach",
      content:
        "Excelente. Ya tengo una primera impresión de cómo aprendes. No te voy a dar una calificación — eso no sirve. Lo que tengo es un mapa inicial de cómo funciona tu cerebro con el inglés.\n\nEn el panel de la derecha puedes ver tu punto de partida. Una semilla. Esa semilla representa todo lo que está por crecer.\n\nPor ahora, dime: ¿hay algo específico que quieras lograr con el inglés? ¿Leer documentación técnica sin traducir? ¿Entender conferencias? ¿Escribir código con comentarios en inglés? Cuanto más sepa sobre tu objetivo, mejor puedo ayudarte.",
      timestamp: ts,
    };
  }

  if (coachState.phase === "aprendizaje") {
    if (!coachState.sessionStarted) {
      return {
        id: `coach-${Date.now()}`,
        role: "coach",
        content:
          `Perfecto. Empecemos.\n\n${sessionNumber === 1 ? "Vamos a tener nuestra primera sesión formal" : `Arrancamos la sesión ${sessionNumber}`}. No es un examen — es solo una conversación donde voy a observar cómo procesas la información.\n\nSolo relájate y habla conmigo como lo harías normalmente. Yo me encargo del resto.`,
        timestamp: ts,
      };
    }

    const wordSection =
      newWords && newWords.length > 0
        ? `\n\n---\n\nVamos con ${newWords.length === 1 ? "una palabra nueva. Mira esta" : "palabras nuevas. Mira estas"}:\n\n${newWords
            .map((w) => `• **${w.word}** → ${w.spanish}\n  Pronunciación: ${w.pronunciation}`)
            .join("\n")}\n  Te la vas a encontrar siempre en el mundo de la tecnología.\n\nIntenta usarla cuando tenga sentido. Sin presión.`
        : "";

    return {
      id: `coach-${Date.now()}`,
      role: "coach",
      content:
        `Perfecto, seguimos avanzando.${wordSection}`,
      timestamp: ts,
    };
  }

  return {
    id: `coach-${Date.now()}`,
    role: "coach",
    content: "Estoy procesando tu respuesta. Vamos paso a paso.",
    timestamp: ts,
  };
}

export interface UserAnalysis {
  interests: string[];
  hasTechAffinity: boolean;
  hasPastFrustration: boolean;
  learningStyles: (keyof LearningPreferences)[];
}

// "sin datos" en lugar de 0% cuando la métrica aún no se ha medido.
function pct(value: number): string {
  return value > 0 ? `${value}%` : "sin datos";
}

export function generateSessionPrompt(
  profile: LearnerProfile,
  session: ActiveSession
): string {
  const nivel =
    profile.currentLevel === "desconocido"
      ? "Aún no determinado"
      : profile.currentLevel;
  const wordsIntroduced = session.wordsIntroduced.map(
    (w) => `${w.word} (${w.spanish})`
  );
  const wordsUsed = session.wordsIntroduced
    .filter((w) => w.usedByUser)
    .map((w) => w.word);

  const totalSeconds = Math.round(session.durationSeconds);
  const min = Math.floor(totalSeconds / 60);
  const seg = totalSeconds % 60;

  return `=== REPORTE DE SESIÓN — Fase 1 ===
Fecha: ${new Date(session.startedAt).toLocaleDateString("es-MX")}
Duración: ${min}m ${seg}s
Mensajes: ${session.messagesCount}
Palabras introducidas: ${session.wordsIntroduced.length}
Palabras usadas: ${wordsUsed.length > 0 ? wordsUsed.join(", ") : "ninguna aún"}
Errores detectados: ${session.userMistakes.length}

--- Métricas actualizadas ---
Nivel aproximado: ${nivel}
Inglés usado en conversación: ${100 - profile.spanishPercentage}%
Sesiones completadas: ${profile.totalSessions}
Palabras aprendidas (acumuladas): ${profile.wordsLearned}

--- Palabras introducidas en esta sesión ---
${wordsIntroduced.length > 0 ? wordsIntroduced.map((w) => `• ${w}`).join("\n") : "Ninguna aún"}

--- Errores detectados ---
${
  session.userMistakes.length > 0
    ? session.userMistakes
        .map(
          (m) =>
            `• "${m.original}" → "${m.correction}" (${m.explanation})`
        )
        .join("\n")
    : "Ninguno registrado. La detección automática de errores aún no está implementada."
}

--- Análisis del coach ---
${
  session.messagesCount < 5
    ? "Sesión corta. Primera toma de contacto. El sistema está calibrando tu línea base."
    : "Sesión con suficiente interacción. Se detectaron patrones iniciales de aprendizaje."
}

--- Instrucciones para fase siguiente ---
Con base en esta sesión real:
1. Ajustar dificultad según ${wordsIntroduced.length > 0 ? "palabras introducidas" : "conversación inicial"}
2. ${profile.wordsLearned > 0 ? `Reforzar palabras: ${profile.wordsLearned}` : "Introducir nuevo vocabulario técnico"}
3. Continuar con sesiones formales para generar datos reales
4. Actualizar visualización de semilla con métricas reales`;
}

export function generateProfilePrompt(profile: LearnerProfile): string {
  const nivel =
    profile.currentLevel === "desconocido"
      ? "Aún no determinado"
      : profile.currentLevel;
  const intereses =
    profile.interests.length > 0
      ? profile.interests.join(", ")
      : "No detectados aún";

  const { reading, listening, speaking, writing } = profile.learningPreferences;
  const estiloDominante = (() => {
    const max = Math.max(reading, listening, speaking, writing);
    if (max === 0) return "No detectado aún";
    const estilos: string[] = [];
    if (reading === max) estilos.push("lectura");
    if (listening === max) estilos.push("audio/video");
    if (speaking === max) estilos.push("conversación");
    if (writing === max) estilos.push("escritura");
    return estilos.join(" + ");
  })();

  return `=== PERFIL DE APRENDIZAJE — Fase ${profile.totalSessions > 0 ? "1" : "0"} ===
Generado: ${new Date().toISOString().split("T")[0]}

Intereses detectados: ${intereses}
Afinidad con tecnología: ${profile.interests.length > 0 ? "Sí" : "No detectada"}
Frustraciones previas: ${profile.behaviorSignals.frustrationSignals === "moderado" || profile.behaviorSignals.frustrationSignals === "alto" ? "Sí" : "No detectadas"}
Estilo de aprendizaje dominante: ${estiloDominante}

--- Métricas ---
Nivel actual: ${nivel}
Español: ${profile.spanishPercentage}%
Exactitud gramatical: ${pct(profile.grammarAccuracy)}
Comprensión: ${pct(profile.comprehensionSpeed)}
Retención: ${pct(profile.retentionRate)}
Consistencia: ${profile.totalSessions > 0 ? `${profile.consistency}%` : "sin datos"}

--- Preferencias ---
Lectura: ${reading}% | Audio/video: ${listening}% | Conversación: ${speaking}% | Escritura: ${writing}%

--- Estado de la app ---
Fase: ${profile.totalSessions > 0 ? "1" : "0 (diagnóstico)"}
Sesiones completadas: ${profile.totalSessions}
Palabras aprendidas: ${profile.wordsLearned}

${
  profile.totalSessions > 0
    ? `---

=== INSTRUCCIONES PARA SIGUIENTE FASE ===

Basado en ${profile.totalSessions} sesión(es) real(es):

1. **Nivel actual:** ${nivel}
2. **Método que funciona:** ${estiloDominante !== "No detectado aún" ? `Priorizar ${estiloDominante}` : "Seguir explorando métodos"}
3. **${profile.wordsLearned > 0 ? `Reforzar vocabulario existente (${profile.wordsLearned} palabras aprendidas)` : "Introducir vocabulario básico técnico"}**
4. **Features a construir:**
   - Persistencia en base de datos (reemplazar localStorage)
   - Análisis de errores más profundo con IA
   - Ejercicios interactivos contextuales
   - Gamificación opcional con rachas
5. **Regla:** Seguir mostrando progreso honesto sin puntajes falsos`
    : `---

=== INSTRUCCIONES PARA FASE 1 ===

Usa este perfil como contexto. Con base en mis datos reales:

1. **Ajusta el tono del coach:** ${estiloDominante !== "No detectado aún" ? `Refuerza el aprendizaje vía ${estiloDominante}.` : "Continúa experimentando para detectar mi estilo."}
   ${profile.interests.length > 0 ? `Mis intereses son: ${intereses}. Usa contenido relacionado para engancharme.` : "Sigue explorando mis intereses."}
   ${profile.behaviorSignals.frustrationSignals !== "sin datos" && profile.behaviorSignals.frustrationSignals !== "bajo" ? "Tuve malas experiencias previas con el inglés. Ve con calma. Sin presión." : "Sin frustraciones previas detectadas. Podemos avanzar."}

2. **Primera introducción de inglés:** Vocabulario básico contextualizado. Sin ejercicios repetitivos. Palabras con utilidad real para mi día a día.

3. **Método principal:** ${estiloDominante !== "No detectado aún" ? `Priorizar ${estiloDominante}.` : "Alternar entre los 4 estilos para medir cuál funciona mejor."}

4. **Features a construir:** Sistema de sesiones reales (registrar inicio/fin, palabras nuevas, errores). Visualización de la semilla que crece con datos reales. Métricas que se actualizan con evidencia.

5. **Regla:** Nunca mostrar progreso falso. Si no he mejorado, la app lo refleja honestamente.`
  }`;
}

export function analyzeUserResponse(message: string): UserAnalysis {
  const techKeywords = [
    "programar",
    "código",
    "software",
    "desarrollar",
    "programación",
    "ingeniería",
    "sistemas",
    "web",
    "app",
    "base de datos",
    "servidor",
    "frontend",
    "backend",
    "devops",
    "cloud",
    "machine learning",
    "ia",
    "inteligencia artificial",
    "datos",
    "algoritmo",
    "github",
    "linux",
    "code",
    "developer",
    "engineer",
    "tech",
    "technology",
    "programming",
    "react",
    "next",
    "python",
    "javascript",
    "typescript",
    "rust",
    "go",
  ];

  const frustrationKeywords = [
    "frustrante",
    "difícil",
    "no pude",
    "abandoné",
    "dejé",
    "me costó",
    "no entendía",
    "confuso",
    "malo",
    "pésimo",
    "no funcionó",
    "fracaso",
    "no aprendí",
    "estancado",
    "frustrado",
  ];

  const interests = techKeywords.filter((kw) => containsTerm(message, kw));
  const hasTechAffinity = interests.length > 0;
  const hasPastFrustration = frustrationKeywords.some((kw) =>
    containsTerm(message, kw)
  );

  const styleTerms: Record<keyof LearningPreferences, string[]> = {
    reading: ["leer", "leyendo", "lectura", "documentación", "docs", "libro", "libros", "texto", "textos", "artículo", "artículos"],
    listening: ["video", "videos", "ver", "viendo", "mirar", "visual", "youtube", "película", "películas", "serie", "series", "podcast", "podcasts", "escuchar", "escuchando", "audio"],
    speaking: ["hablar", "hablando", "conversar", "conversación", "conversando", "oral", "pronunciar", "dialogar"],
    writing: ["escribir", "escribiendo", "escritura", "redactar"],
  };

  const learningStyles = (
    Object.keys(styleTerms) as (keyof LearningPreferences)[]
  ).filter((style) => styleTerms[style].some((t) => containsTerm(message, t)));

  return {
    interests,
    hasTechAffinity,
    hasPastFrustration,
    learningStyles,
  };
}

// Palabras introducidas que el usuario usó por primera vez en este mensaje.
// Se ignoran las que se escriben igual en español: no prueban inglés.
export function checkEnglishUsage(
  message: string,
  words: EnglishWord[]
): string[] {
  return words
    .filter(
      (w) =>
        !w.usedByUser &&
        !AMBIGUOUS_WORDS.has(w.word) &&
        containsTerm(message, w.word)
    )
    .map((w) => w.word);
}

const ENGLISH_VOCAB = new Set([
  ...ENGLISH_COMMON_WORDS,
  ...ENGLISH_WORDS.map((w) => w.word).filter((w) => !AMBIGUOUS_WORDS.has(w)),
]);

// Porcentaje aproximado de palabras en español en los mensajes del usuario.
export function computeSpanishPercentage(messages: Message[]): number {
  const tokens = messages
    .filter((m) => m.role === "user")
    .flatMap((m) => m.content.toLowerCase().match(/\p{L}+/gu) ?? []);
  if (tokens.length === 0) return 100;
  const english = tokens.filter((t) => ENGLISH_VOCAB.has(t)).length;
  return Math.round(100 - (english / tokens.length) * 100);
}

export function pickNewWords(
  alreadyIntroduced: EnglishWord[],
  count: number,
  hasTechAffinity: boolean
): EnglishWord[] {
  const available = ENGLISH_WORDS.filter(
    (w: EnglishWord) => !alreadyIntroduced.some((a) => a.word === w.word)
  );

  if (available.length === 0) return [];

  const preferred = hasTechAffinity
    ? available.filter((w: EnglishWord) => w.category === "tech")
    : available;

  const pool = preferred.length >= count ? preferred : available;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function isEndSessionCommand(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return (
    lower === "/end" ||
    lower === "/fin" ||
    lower === "terminar sesión" ||
    lower === "terminar" ||
    lower === "eso es todo" ||
    lower === "finalizar"
  );
}
