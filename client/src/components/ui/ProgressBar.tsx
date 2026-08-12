import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export interface ProgressBarProps {
  value: number; // 0 to max
  max?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'segmented' | 'stat' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = true,
  label,
  variant = 'segmented',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Animated counter
  const springValue = useSpring(0, { duration: 1.2, bounce: 0 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  const isGold = variant === 'gold';
  const totalSegments = 10;
  const activeSegments = Math.round((percentage / 100) * totalSegments);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-baseline mb-2 text-xs text-slate-400 font-hud tracking-wider uppercase">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isGold ? 'bg-amber-400 shadow-hud-gold' : 'bg-cyan-400 shadow-hud-cyan'}`} />
            {label || 'System Capacity'}
          </span>
          <span className="tabular-nums font-bold text-slate-100">
            {displayValue} / {max}
          </span>
        </div>
      )}

      {variant === 'stat' ? (
        /* Smooth Gradient StatBar */
        <div className="w-full bg-slate-950 border border-cyan-500/30 p-0.5 clip-corner-sm shadow-hud-cyan">
          <motion.div
            className="h-2 bg-gradient-to-r from-cyan-600 via-cyan-400 to-amber-400 shadow-hud-cyan clip-corner-sm"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      ) : (
        /* Chunky SegmentedBar (8-12 discrete glowing block tiles) */
        <div className="flex items-center gap-1.5 w-full bg-slate-950/80 border border-cyan-500/30 p-1.5 clip-corner shadow-hud-cyan">
          {Array.from({ length: totalSegments }).map((_, idx) => {
            const isActive = idx < activeSegments;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scaleY: 0.5 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: idx * 0.04, duration: 0.2 }}
                className={`h-3 flex-1 clip-corner-sm transition-all duration-300 ${
                  isActive
                    ? isGold
                      ? 'bg-amber-400 shadow-hud-gold border border-amber-200'
                      : 'bg-cyan-400 shadow-hud-cyan border border-cyan-200'
                    : 'bg-slate-900 border border-slate-800'
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
