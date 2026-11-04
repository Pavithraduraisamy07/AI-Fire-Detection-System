import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SensorGaugeProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: LucideIcon;
  min?: number;
  max?: number;
  thresholdWarning?: number;
  thresholdCritical?: number;
  inverseRisk?: boolean; // For humidity where low values are higher risk
  colorScheme?: 'red' | 'amber' | 'blue' | 'emerald' | 'purple';
  subtitle?: string;
}

export const SensorGauge: React.FC<SensorGaugeProps> = ({
  label,
  value,
  unit = '',
  icon: Icon,
  min = 0,
  max = 100,
  thresholdWarning = 45,
  thresholdCritical = 60,
  inverseRisk = false,
  colorScheme = 'blue',
  subtitle
}) => {
  const numVal = typeof value === 'number' ? value : 0;
  const clampedVal = Math.min(Math.max(numVal, min), max);
  const percentage = Math.round(((clampedVal - min) / (max - min)) * 100);

  // Determine state
  let isCritical = false;
  let isWarning = false;

  if (inverseRisk) {
    if (numVal <= thresholdCritical) isCritical = true;
    else if (numVal <= thresholdWarning) isWarning = true;
  } else {
    if (numVal >= thresholdCritical) isCritical = true;
    else if (numVal >= thresholdWarning) isWarning = true;
  }

  const borderClass = isCritical
    ? 'border-red-500/50 shadow-lg shadow-red-950/40 bg-gradient-to-b from-red-950/20 to-slate-900/90'
    : isWarning
    ? 'border-amber-500/50 shadow-lg shadow-amber-950/30 bg-gradient-to-b from-amber-950/20 to-slate-900/90'
    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700';

  const badgeClass = isCritical
    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
    : isWarning
    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
    : 'bg-slate-800/80 text-slate-300 border border-slate-700/50';

  const progressColor = isCritical
    ? 'bg-red-500'
    : isWarning
    ? 'bg-amber-400'
    : colorScheme === 'blue'
    ? 'bg-cyan-500'
    : colorScheme === 'emerald'
    ? 'bg-emerald-500'
    : 'bg-indigo-500';

  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 ${borderClass}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
            {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>

        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${badgeClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="mt-4">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>{min}{unit}</span>
          <span>{subtitle || `${percentage}% of max`}</span>
          <span>{max}{unit}</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Threshold Status Marker */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs">
        <span className="text-slate-400">Sensor Status</span>
        <span
          className={`font-semibold ${
            isCritical
              ? 'text-red-400 animate-pulse'
              : isWarning
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}
        >
          {isCritical ? 'CRITICAL LEVEL' : isWarning ? 'WARNING THRESHOLD' : 'NOMINAL SAFE'}
        </span>
      </div>
    </div>
  );
};
