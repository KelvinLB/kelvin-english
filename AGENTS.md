# Kelvin English — AGENTS.md

## Identidad del proyecto

App personal de aprendizaje de inglés con dos paneles siempre visibles:
- **Coach** — conversación adaptativa que descubre cómo aprende el usuario
- **Evolución** — panel visual con métricas honestas y una semilla que crece

Stack: Next.js 15 + TypeScript + Tailwind CSS v4 + localStorage

Dev server fijo en el puerto 3100 (`npm run dev`). localStorage depende del origen: cambiar de puerto equivale a empezar con datos vacíos.

## Visión de producto

- Doble objetivo: potenciar el aprendizaje real del usuario Y construir una app que sirva a otros.
- Audiencia futura: profesionales tech en general (developers, QA, diseño, producto, data) que necesitan inglés para trabajar.
- Estrategia actual (decidida por el usuario):
  - Coach con reglas fijas por ahora (sin API de IA).
  - Datos locales, uso personal primero; cuentas y base de datos llegan después de validar.
  - El usuario reinició su progreso y usa la app como primer usuario real: cada sesión revela qué pulir.
- Diseñar pensando en otros: nada de contenido exclusivo para developers en el núcleo; los intereses de cada usuario deciden el vocabulario y los ejemplos.

## Perfil del usuario

- Ingeniero de software (mentalidad de sistemas, lógica, patrones)
- Aprende analizando el "por qué" detrás de las cosas
- Se aburre con ejercicios repetitivos sin propósito
- Se engancha con tecnología, documentación técnica, código
- Mejor feedback = code review, no calificaciones
- Quiere ver progreso visual real, sin puntajes falsos
- Prefiere autonomía del sistema — no quiere responder preguntas constantemente

## Reglas de interacción

### Idioma
- **Siempre** asumir nivel de inglés = cero al inicio
- Escribir en español hasta tener evidencia real de comprensión
- Introducir inglés gradualmente, con aviso previo
- Si el usuario muestra confusión, regresar al español inmediatamente
- Primeras palabras en inglés: técnicas y contextuales (error, function, console, etc.)

### Tono
- Coach personal, no profesor tradicional ni asistente genérico
- Feedback tipo code review, no calificaciones
- Descubrir cómo aprende el usuario, no enseñar de forma genérica
- Analizar en silencio, no mostrar resultados de tests intermedios

### Honestidad
- Mostrar progreso REAL siempre
- Si el nivel es desconocido, mostrar "desconocido"
- Si retrocedió, mostrarlo
- El mapa de evolución es un espejo, no un trofeo

## Decisiones de diseño

- Tema oscuro (slate-950 fondo, slate-800 paneles)
- Acento cyan-400 (tecnología), énfasis amber-400 (energía/progreso)
- Semilla visual con símbolos de código orbitando ({}, //, </>, fn)
- Métricas específicas para developers: docs técnicas, código comentado, errores de consola
- Fase 0: diagnóstico con 3 preguntas de sondeo (sin parecer examen)
- Fase 1: sistema de sesiones formales con métricas reales

## REGLAS CRÍTICAS DEL FLUJO DE EVOLUCIÓN

### El flujo de continuidad

1. Usuario abre la app → contesta el cuestionario diagnóstico
2. Al finalizar, la app genera un **prompt de continuidad**
3. Usuario copia el prompt y lo pega aquí (en esta conversación con la IA)
4. La IA lee el prompt + localStorage → entiende el estado real del usuario
5. La IA construye/evoluciona la app basándose en:
   - El prompt (intención del usuario, instrucciones para siguiente fase)
   - localStorage (datos acumulados: perfil, sesiones, palabras, historial)
6. Al reconstruir/levantar la app, esta lee localStorage y restaura el estado exacto
7. El usuario continúa desde donde quedó — NUNCA repite el cuestionario
8. Después de cada sesión, se genera un nuevo prompt de continuidad

### Regla 1: localStorage es la fuente de verdad
- **NUNCA** reiniciar datos sin confirmación explícita del usuario
- Al reconstruir la app, **SIEMPRE** leer localStorage primero
- Si hay datos existentes, continuar desde ahí (no desde cero)
- El cuestionario diagnóstico **NUNCA** se muestra de una vez completado
- Si `totalSessions > 0` → App está en modo sesiones activas
- Si `phase === "aprendizaje"` → Saltar directo a sesiones

### Regla 2: El prompt es el puente de comunicación
- Usuario pega prompt aquí = "mándame el contexto para evolucionar"
- El prompt contiene: perfil, métricas, estado actual, instrucciones para siguiente fase
- La IA usa ese prompt + localStorage para decidir qué construir
- Después de aplicar los cambios, la app debe mostrar un indicador de "continuar" o checkpoint

### Regla 3: Transición de fases
- Fase 0 (diagnóstico): Solo una vez, nunca se repite
- Una vez completado Fase 0, el cuestionario desaparece permanentemente
- Las siguientes interacciones son SESIONES DE APRENDIZAJE (Fase 1+)
- Cada sesión genera su propio reporte/prompt al finalizar
- El prompt de diagnóstico SOLO aparece en la transición Fase 0 → Fase 1

### Regla 4: Continuidad garantizada
- La app debe restaurar TODO el estado desde localStorage al iniciar:
  - Mensajes de conversación
  - Estado del coach (fase, índice de preguntas, sesión activa)
  - Perfil del usuario (métricas, intereses, preferencias)
  - Sesión activa (si existe)
  - Palabras introducidas en la sesión actual
- Si hay una sesión activa al reconstruir, mostrar indicador de "continuar sesión"
- El usuario nunca pierde su progreso al cerrar/reabrir la app

## Arquitectura

### Almacenamiento
- Fase 0-1: localStorage
- Futuro: migrar a base de datos (Supabase u otra)
- Claves en localStorage: profile, messages, coach-state, active-session, words-introduced, last-report

### Flujo de datos
1. Coach recibe mensaje del usuario
2. Analiza contenido (keywords, estilo, errores)
3. Actualiza perfil en memoria y localStorage
4. Coach responde con mensaje contextual
5. Panel de evolución lee perfil y renderiza visualmente
6. Cada sesión genera un prompt de continuidad

### Sistema de sesiones (Fase 1+)
- Primera interacción del usuario inicia una sesión
- Sesión activa: tracking de duración, palabras introducidas, errores
- Fin de sesión: inactividad (3 min), comando "/end", o botón
- Post-sesión: reporte automático con métricas y prompt

### Prompts de continuidad
- Cada fase/sesión genera un prompt que el usuario puede pegar aquí
- El prompt contiene: perfil actualizado, métricas, análisis, instrucciones para siguiente fase
- Esto permite que la app evolucione sin perder contexto

## Próximas fases (no implementadas aún)

- Fase 2: base de datos real, autenticación, sesiones multi-dispositivo
- Fase 3: integración con APIs de IA para análisis más profundo
- Fase 4: ejercicios interactivos, quizzes, práctica deliberada
- Fase 5: comunidad, rachas, gamificación opcional

## Patrones de código

- Componentes en `app/components/{coach,evolution,ui}/`
- Hooks en `app/hooks/`
- Lógica pura en `app/lib/` (sin JSX)
- useCoach como orquestador principal de estado
- Persistencia automática en localStorage
- Animaciones vía CSS keyframes + inline styles
- Responsive: desktop lado a lado, mobile con tabs
