"use client";

interface GrowingSeedProps {
  sessionCount: number;
  wordsLearned: number;
  accuracy: number;
  comprehension: number;
}

const SYMBOLS = ["{ }", "/ /", "</>", "fn()", "=>", "[ ]"];

export default function GrowingSeed({
  sessionCount,
  wordsLearned,
  accuracy,
  comprehension,
}: GrowingSeedProps) {
  const hasGrowth = sessionCount > 0;
  const glowIntensity = hasGrowth ? "opacity-100 scale-110" : "opacity-60";
  const symbolCount = hasGrowth ? SYMBOLS.length + Math.min(sessionCount, 4) : SYMBOLS.length;
  const orbitSpeed = hasGrowth ? 4 : 7;
  const nodes = Math.min(sessionCount, 6);
  const particles = Math.min(wordsLearned, 12);

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-64 h-64">
        {/* Outer rings — more rings with more sessions */}
        <div
          className={`absolute inset-0 rounded-full border transition-all duration-1000 ${
            hasGrowth ? "border-slate-700/60" : "border-slate-800/60"
          }`}
        />
        <div
          className={`absolute inset-4 rounded-full border-dashed transition-all duration-1000 ${
            hasGrowth ? "border-slate-700/40 border" : "border-slate-800/40 border"
          }`}
        />
        {hasGrowth && (
          <div className="absolute inset-8 rounded-full border border-slate-700/20" />
        )}
        {nodes >= 3 && (
          <div className="absolute inset-12 rounded-full border border-dashed border-amber-500/20" />
        )}

        {/* Orbiting symbols */}
        {Array.from({ length: symbolCount }).map((_, i) => {
          const orbitSize = 60 + (i % 6) * 18;
          const dur = (orbitSpeed + i * 2) * (hasGrowth ? 0.7 : 1);
          const direction = i % 2 === 0 ? "normal" : "reverse";
          const symbol = SYMBOLS[i % SYMBOLS.length];
          const delay = i * 0.5;

          return (
            <div
              key={`symbol-${i}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i >= SYMBOLS.length ? "opacity-70" : "opacity-100"
              }`}
              style={{
                animation: `spin ${dur}s linear ${delay}s infinite ${direction}`,
              }}
            >
              <div
                className={`absolute left-1/2 -translate-x-1/2 font-mono whitespace-nowrap select-none transition-all duration-700 ${
                  i >= SYMBOLS.length
                    ? "text-emerald-500/40 text-[8px]"
                    : "text-cyan-500/40 text-xs"
                }`}
                style={{ top: `${orbitSize}px` }}
              >
                {symbol}
              </div>
            </div>
          );
        })}

        {/* Knowledge particles — small dots connecting out */}
        {Array.from({ length: particles }).map((_, i) => {
          const angle = (i / particles) * 360;
          const dist = 40 + (i % 3) * 20;
          const rad = (angle * Math.PI) / 180;
          const x = 128 + Math.cos(rad) * dist;
          const y = 128 + Math.sin(rad) * dist;

          return (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          );
        })}

        {/* Growth nodes — appear as sessions increase */}
        {Array.from({ length: nodes }).map((_, i) => {
          const angle = (i / nodes) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const dist = 80;
          const x = 128 + Math.cos(rad) * dist;
          const y = 128 + Math.sin(rad) * dist;

          return (
            <div key={`node-${i}`}>
              <div
                className="absolute w-2 h-2 bg-amber-400/60 rounded-full"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  filter: "blur(1px)",
                }}
              />
              {/* Connection line from center to node */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1="128"
                  y1="128"
                  x2={x}
                  y2={y}
                  stroke="rgba(251, 191, 36, 0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  style={{ animation: `float-in 1s ease-out forwards` }}
                />
              </svg>
            </div>
          );
        })}

        {/* Central seed */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div
              className={`absolute -inset-5 rounded-full blur-xl transition-all duration-1000 ${
                hasGrowth
                  ? "bg-amber-500/15 animate-pulse"
                  : "bg-cyan-500/10"
              }`}
              style={{
                animationDuration: hasGrowth ? "2s" : "3s",
              }}
            />
            <div
              className={`absolute -inset-2 rounded-full blur-md transition-all duration-1000 ${
                hasGrowth ? "bg-amber-400/30" : "bg-cyan-400/20"
              }`}
              style={{
                animation: `pulse-glow ${hasGrowth ? 2 : 3}s ease-in-out infinite`,
              }}
            />
            <div
              className={`w-6 h-6 rounded-full shadow-lg transition-all duration-1000 ${
                hasGrowth
                  ? "bg-amber-400 shadow-amber-400/60"
                  : "bg-cyan-400 shadow-cyan-400/60"
              }`}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 text-center space-y-1">
        <p className={`font-semibold text-lg tracking-wide transition-colors duration-700 ${
          hasGrowth ? "text-amber-400" : "text-cyan-400"
        }`}>
          {sessionCount === 0 ? "Día 0" : `Sesión ${sessionCount}`}
        </p>
        <p className="text-slate-400 text-xs">
          {sessionCount === 0
            ? "Tu repositorio de aprendizaje está vacío"
            : `${wordsLearned} palabras aprendidas${accuracy > 0 ? ` · ${accuracy}% exactitud` : ""}`}
        </p>
        <p className="text-slate-500 text-[10px]">
          {sessionCount === 0
            ? "Cada sesión hará crecer esta semilla"
            : comprehension > 0 ? `Comprensión: ${comprehension}%` : "Sigue creciendo"}
        </p>
      </div>
    </div>
  );
}
