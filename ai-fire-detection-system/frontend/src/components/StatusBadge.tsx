import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, AlertTriangle, Flame } from 'lucide-react';

interface StatusBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulsing?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  pulsing = true
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-4 py-2 text-sm font-bold tracking-wide'
  };

  if (level === 'HIGH RISK') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/70 text-red-400 shadow-sm shadow-red-900/50 ${sizeClasses[size]}`}
      >
        {pulsing && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
          </span>
        )}
        {showIcon && <Flame className="h-3.5 w-3.5 text-red-400" />}
        <span>HIGH RISK</span>
      </span>
    );
  }

  if (level === 'WARNING') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/70 text-amber-300 shadow-sm shadow-amber-900/40 ${sizeClasses[size]}`}
      >
        {pulsing && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400"></span>
          </span>
        )}
        {showIcon && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
        <span>WARNING</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 ${sizeClasses[size]}`}
    >
      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
      {showIcon && <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
      <span>NORMAL</span>
    </span>
  );
};
