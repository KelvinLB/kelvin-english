"use client";

import type { LearnerProfile } from "../../lib/types";
import MetricCard from "./MetricCard";

interface MetricsGridProps {
  profile: LearnerProfile;
}

// Una métrica en 0 todavía no se ha medido: se muestra "—", no "0%".
function measured(value: number): number | string {
  return value > 0 ? value : "—";
}

export default function MetricsGrid({ profile }: MetricsGridProps) {
  const metrics = [
    {
      label: "Nivel actual",
      value:
        profile.currentLevel === "desconocido" ? "—" : profile.currentLevel,
      unit: undefined,
      description: "Tu nivel estimado según el MCER",
    },
    {
      label: "Español",
      value: profile.spanishPercentage,
      description: "Porcentaje de comunicación en español",
    },
    {
      label: "Exactitud",
      value: measured(profile.grammarAccuracy),
      description: "Precisión gramatical en inglés",
    },
    {
      label: "Comprensión",
      value: measured(profile.comprehensionSpeed),
      description: "Velocidad de comprensión",
    },
    {
      label: "Retención",
      value: measured(profile.retentionRate),
      description: "Memoria entre sesiones",
    },
    {
      label: "Docs técnicas",
      value: measured(profile.techDocsComprehension),
      description: "Comprensión de documentación técnica",
    },
    {
      label: "Código",
      value: measured(profile.codeCommentReading),
      description: "Lectura de código comentado en inglés",
    },
    {
      label: "Errores",
      value: measured(profile.errorMessageUnderstanding),
      description: "Comprensión de mensajes de error",
    },
    {
      label: "Consistencia",
      value: profile.totalSessions > 0 ? profile.consistency : "—",
      description: "Días con sesión en los últimos 7",
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-slate-300 text-sm font-medium">
        Métricas de aprendizaje
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {metrics.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            unit={m.unit}
            description={m.description}
          />
        ))}
      </div>
      <p className="text-slate-600 text-[10px] text-center mt-1">
        Actualizado:{" "}
        {profile.lastUpdate
          ? new Date(profile.lastUpdate).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "sin datos"}
      </p>
    </div>
  );
}
