"use client";

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  description: string;
}

export default function MetricCard({
  label,
  value,
  unit = "%",
  description,
}: MetricCardProps) {
  const numericValue = typeof value === "number" ? value : 0;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-slate-400 text-xs font-medium">{label}</span>
        <span className="text-cyan-400 text-xs font-mono tabular-nums">
          {typeof value === "number" ? `${value}${unit}` : value}
        </span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-slate-600 via-cyan-700 to-cyan-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(numericValue, 100)}%` }}
        />
      </div>
      <p className="text-slate-500 text-[10px] mt-1.5 leading-tight">
        {description}
      </p>
    </div>
  );
}
